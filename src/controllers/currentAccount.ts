import { isNotNull } from '_core/isNotNull';
import { type BalancesItem } from 'balances/types';
import { collectBalances } from 'balances/utils';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { type ExtensionStorage } from '../storage/storage';
import { WavesApi } from './api';
import { type AssetInfoController } from './assetInfo';
import { type NetworkController } from './network';
import { type NftInfoController } from './NftInfoController';
import { type PreferencesController } from './preferences';
import { BalanceService } from './services';
import { type VaultController } from './VaultController';

const PERIOD_IN_SECONDS = 10;

export class CurrentAccountController {
  private store;
  private assetInfoController;
  private nftInfoController;
  private getAccounts;
  private getNetwork;
  private getNode;
  private getSelectedAccount;
  private isLocked;
  private balanceService;
  private wavesApi;
  private networkController;

  constructor({
    extensionStorage,
    assetInfoController,
    nftInfoController,
    getAccounts,
    getNetwork,
    getNode,
    getSelectedAccount,
    isLocked,
    networkController,
  }: {
    extensionStorage: ExtensionStorage;
    assetInfoController: AssetInfoController;
    nftInfoController: NftInfoController;
    getAccounts: PreferencesController['getAccounts'];
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
    getSelectedAccount: PreferencesController['getSelectedAccount'];
    isLocked: VaultController['isLocked'];
    networkController: NetworkController;
  }) {
    const defaults: Partial<Record<string, BalancesItem>> = Object.fromEntries(
      getAccounts()
        .map(acc => {
          if (acc.accountType === 'multichain') {
            return [
              `balance_${acc.accounts.ethereum?.address ?? ''}`,
              undefined,
            ];
          } else if ('address' in acc) {
            return [`balance_${acc.address}`, undefined];
          }
          return [undefined, undefined];
        })
        .filter(([key]) => key),
    );

    const initState = extensionStorage.getInitState(defaults);

    const emptyKeys = Object.entries(initState)
      .filter(([, value]) => value == null)
      .map(([key]) => key);

    extensionStorage.removeState(emptyKeys);

    emptyKeys.forEach(key => {
      delete initState[key];
    });

    this.store = new ObservableStore(initState);

    extensionStorage.subscribe(this.store);

    this.assetInfoController = assetInfoController;
    this.nftInfoController = nftInfoController;
    this.getAccounts = getAccounts;
    this.getNetwork = getNetwork;
    this.getNode = getNode;
    this.getSelectedAccount = getSelectedAccount;
    this.isLocked = isLocked;
    this.networkController = networkController;

    this.balanceService = new BalanceService(this.getNode);
    this.wavesApi = new WavesApi(this.getNode);

    Browser.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'updateCurrentAccountBalance') {
        this.updateCurrentAccountBalance();
      }
    });

    this.restartPolling();
  }

  restartPolling() {
    Browser.alarms.create('updateCurrentAccountBalance', {
      periodInMinutes: PERIOD_IN_SECONDS / 60,
    });
  }

  getAccountBalance() {
    const selectedAccount = this.getSelectedAccount();
    let address: string | undefined;
    if (!selectedAccount) return undefined;
    if (selectedAccount.accountType === 'multichain') {
      address = selectedAccount.accounts.ethereum?.address;
    } else if ('address' in selectedAccount) {
      address = selectedAccount.address;
    }
    if (!address) return undefined;
    const state = this.store.getState();
    const balances = collectBalances(state);
    return balances[address];
  }

  async updateCurrentAccountBalance() {
    const currentNetwork = this.getNetwork();
    const currentNetworkProfile =
      this.networkController.getCurrentNetworkProfile();
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || !activeAccount) return;

    if (activeAccount.accountType === 'multichain') {
      const promises = [];

      const ethereumAccount =
        activeAccount.accounts.ethereum || activeAccount.accounts.unit0;
      if (ethereumAccount) {
        const balancePromise = this.balanceService
          .fetchUnit0Balance(ethereumAccount.address, currentNetworkProfile)
          .then(balance => {
            this.store.updateState({
              [`balance_${ethereumAccount.address}`]: balance,
            });
          });
        promises.push(balancePromise);
      }

      const wavesAccount = activeAccount.accounts.waves;
      if (wavesAccount) {
        const wavesBalancePromise = this.balanceService
          .fetchWavesBalanceData(wavesAccount.address)
          .then(
            async ([wavesBalance, myAssets, myNfts, aliases, txHistory]) => {
              const assets = this.assetInfoController.getAssets();

              const assetExists = (assetId: string) => !!assets[assetId];

              const isMaxAgeExceeded = (assetId: string) =>
                this.assetInfoController.isMaxAgeExceeded(
                  assets[assetId]?.lastUpdated,
                );

              const isSponsorshipUpdated = (balanceAsset: {
                assetId: string;
                minSponsoredAssetFee: string | null;
              }) =>
                balanceAsset.minSponsoredAssetFee !==
                assets[balanceAsset.assetId]?.minSponsoredFee;

              const fetchAssetIds = (
                myAssets.balances.filter(
                  info =>
                    !assetExists(info.assetId) ||
                    isSponsorshipUpdated(info) ||
                    isMaxAgeExceeded(info.assetId),
                ) as Array<{ assetId: string }>
              )
                .concat(
                  myNfts.filter(
                    info =>
                      !assetExists(info.assetId) ||
                      isMaxAgeExceeded(info.assetId),
                  ),
                )
                .map(info => info.assetId)
                .concat(
                  txHistory
                    .flatMap(tx => [
                      ...('assetId' in tx ? [tx.assetId] : []),
                      ...('order1' in tx
                        ? [
                            tx.order1.assetPair.amountAsset,
                            tx.order1.assetPair.priceAsset,
                          ]
                        : []),
                      ...('payment' in tx
                        ? tx.payment?.map(x => x.assetId) ?? []
                        : []),
                      ...('stateChanges' in tx
                        ? tx.stateChanges.transfers.map(x => x.asset)
                        : []),
                    ])
                    .filter(isNotNull)
                    .filter(
                      assetId =>
                        !assetExists(assetId) && isMaxAgeExceeded(assetId),
                    ),
                );

              await Promise.all([
                this.assetInfoController.updateAssets(fetchAssetIds, {
                  ignoreCache: true,
                }),
                this.nftInfoController.updateNfts(myNfts),
              ]);

              const balance = await this.balanceService.buildWavesBalance(
                wavesAccount.address,
                currentNetworkProfile,
                wavesBalance,
                myAssets,
                aliases,
                txHistory,
                myNfts,
              );

              this.store.updateState({
                [`balance_${wavesAccount.address}`]: balance,
              });
            },
          );
        promises.push(wavesBalancePromise);
      }

      await Promise.all(promises);
      return;
    }

    let address: string | undefined;
    if ('address' in activeAccount) {
      address = activeAccount.address;
    } else {
      return;
    }

    const [wavesBalance, myAssets, myNfts, aliases, txHistory] =
      await this.balanceService.fetchWavesBalanceData(address);

    const assets = this.assetInfoController.getAssets();

    const assetExists = (assetId: string) => !!assets[assetId];

    const isMaxAgeExceeded = (assetId: string) =>
      this.assetInfoController.isMaxAgeExceeded(assets[assetId]?.lastUpdated);

    const isSponsorshipUpdated = (balanceAsset: {
      assetId: string;
      minSponsoredAssetFee: string | null;
    }) =>
      balanceAsset.minSponsoredAssetFee !==
      assets[balanceAsset.assetId]?.minSponsoredFee;

    const fetchAssetIds = (
      myAssets.balances.filter(
        info =>
          !assetExists(info.assetId) ||
          isSponsorshipUpdated(info) ||
          isMaxAgeExceeded(info.assetId),
      ) as Array<{ assetId: string }>
    )
      .concat(
        myNfts.filter(
          info => !assetExists(info.assetId) || isMaxAgeExceeded(info.assetId),
        ),
      )
      .map(info => info.assetId)
      .concat(
        txHistory
          .flatMap(tx => [
            ...('assetId' in tx ? [tx.assetId] : []),
            ...('order1' in tx
              ? [
                  tx.order1.assetPair.amountAsset,
                  tx.order1.assetPair.priceAsset,
                ]
              : []),
            ...('payment' in tx ? tx.payment?.map(x => x.assetId) ?? [] : []),
            ...('stateChanges' in tx
              ? tx.stateChanges.transfers.map(x => x.asset)
              : []),
          ])
          .filter(isNotNull)
          .filter(
            assetId => !assetExists(assetId) && isMaxAgeExceeded(assetId),
          ),
      );

    await Promise.all([
      this.assetInfoController.updateAssets(fetchAssetIds, {
        ignoreCache: true,
      }),
      this.nftInfoController.updateNfts(myNfts),
    ]);

    const balance = await this.balanceService.buildWavesBalance(
      address,
      currentNetworkProfile,
      wavesBalance,
      myAssets,
      aliases,
      txHistory,
      myNfts,
    );

    this.store.updateState({
      [`balance_${address}`]: balance,
    });
  }

  async updateOtherAccountsBalances() {
    const accounts = this.getAccounts();
    const ethereumAddresses: string[] = [];
    const wavesAddresses: string[] = [];

    accounts.forEach(account => {
      if (account.accountType === 'multichain') {
        const ethereumAddress =
          account.accounts.ethereum?.address || account.accounts.unit0?.address;
        if (ethereumAddress) {
          ethereumAddresses.push(ethereumAddress);
        }

        const wavesAddress = account.accounts.waves?.address;
        if (wavesAddress) {
          wavesAddresses.push(wavesAddress);
        }
      } else if ('address' in account) {
        wavesAddresses.push(account.address);
      }
    });

    const currentNetworkProfile =
      this.networkController.getCurrentNetworkProfile();

    for (const address of ethereumAddresses) {
      const balance = await this.balanceService.fetchUnit0Balance(
        address,
        currentNetworkProfile,
      );
      this.store.updateState({
        [`balance_${address}`]: balance,
      });
    }

    if (wavesAddresses.length > 0) {
      const regularBalances =
        await this.balanceService.updateMultipleWavesBalances([
          ...wavesAddresses,
        ]);
      const storeState = this.store.getState();
      const balances = Object.fromEntries(
        regularBalances.map(regularBalance => {
          const balanceKey = `balance_${regularBalance.id}`;
          const existingBalance = storeState[balanceKey];
          const balance = {
            ...existingBalance,
            regular: regularBalance.balance,
          };
          return [balanceKey, balance];
        }),
      );
      this.store.updateState(balances);
    }
  }
}
