import { isNotNull } from '_core/isNotNull';
import { BigNumber } from '@waves/bignumber';
import { type TransactionFromNode } from '@waves/ts-types';
import { type AssetBalance, type BalancesItem } from 'balances/types';
import { collectBalances } from 'balances/utils';
import { type NftAssetDetail } from 'nfts/types';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { MAX_NFT_ITEMS, MAX_TX_HISTORY_ITEMS } from '../constants';
import { type ExtensionStorage } from '../storage/storage';
import { type AssetInfoController } from './assetInfo';
import { type NetworkController } from './network';
import { type NftInfoController } from './NftInfoController';
import { type PreferencesController } from './preferences';
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

  constructor({
    extensionStorage,
    assetInfoController,
    nftInfoController,
    getAccounts,
    getNetwork,
    getNode,
    getSelectedAccount,
    isLocked,
  }: {
    extensionStorage: ExtensionStorage;
    assetInfoController: AssetInfoController;
    nftInfoController: NftInfoController;
    getAccounts: PreferencesController['getAccounts'];
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
    getSelectedAccount: PreferencesController['getSelectedAccount'];
    isLocked: VaultController['isLocked'];
  }) {
    const defaults: Partial<Record<string, BalancesItem>> = Object.fromEntries(
      getAccounts().map(acc => [`balance_${acc.address}`, undefined]),
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

  async #fetchWavesBalance(address: string) {
    const url = new URL(`addresses/balance/details/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw response;
    }

    const json = (await response.json()) as {
      available: string;
      regular: string;
    };

    return json;
  }

  async #fetchAssetsBalance(address: string) {
    const url = new URL(`assets/balance/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw response;
    }

    const json = (await response.json()) as {
      address: string;
      balances: Array<{
        assetId: string;
        balance: string;
        minSponsoredAssetFee: string | null;
        sponsorBalance: string;
      }>;
    };

    return json;
  }

  async #fetchNfts(address: string) {
    const url = new URL(
      `assets/nft/${address}/limit/${MAX_NFT_ITEMS}`,
      this.getNode(),
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw response;
    }

    const json: NftAssetDetail[] = await response.json();

    return json;
  }

  async #fetchAliases(address: string) {
    const url = new URL(`alias/by-address/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw response;
    }

    const json = (await response.json()) as string[];

    return json;
  }

  async #fetchTxHistory(address: string) {
    const url = new URL(
      `transactions/address/${address}/limit/${MAX_TX_HISTORY_ITEMS}`,
      this.getNode(),
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    if (!response.ok) {
      throw response;
    }

    const json = (await response.json()) as [TransactionFromNode[]];

    return json[0];
  }

  getAccountBalance() {
    const selectedAccount = this.getSelectedAccount();
    const state = this.store.getState();
    const balances = collectBalances(state);

    return selectedAccount && balances[selectedAccount.address];
  }

  async updateCurrentAccountBalance() {
    const currentNetwork = this.getNetwork();
    const accounts = this.getAccounts().filter(
      ({ network }) => network === currentNetwork,
    );
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || accounts.length < 1 || !activeAccount) return;

    const { address } = activeAccount;

    const [wavesBalance, myAssets, myNfts, aliases, txHistory] =
      await Promise.all([
        this.#fetchWavesBalance(address),
        this.#fetchAssetsBalance(address),
        this.#fetchNfts(address),
        this.#fetchAliases(address),
        this.#fetchTxHistory(address),
      ]);

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

    const wavesAssetBalance: AssetBalance = {
      minSponsoredAssetFee: '100000',
      sponsorBalance: wavesBalance.available,
      balance: wavesBalance.available,
    };

    const balance: BalancesItem = {
      aliases,
      available: wavesBalance.available,
      regular: wavesBalance.regular,
      leasedOut: new BigNumber(wavesBalance.regular)
        .sub(wavesBalance.available)
        .toString(),
      network: currentNetwork,
      txHistory,

      assets: Object.fromEntries([
        ['WAVES', wavesAssetBalance],
        ...myAssets.balances.map(info => {
          const assetBalance: AssetBalance = {
            minSponsoredAssetFee: info.minSponsoredAssetFee,
            sponsorBalance: info.sponsorBalance,
            balance: info.balance,
          };

          return [info.assetId, assetBalance];
        }),
      ]),
      nfts: myNfts.map(nft => ({
        id: nft.assetId,
        name: nft.name,
        precision: nft.decimals,
        description: nft.description,
        height: nft.issueHeight,
        timestamp: new Date(nft.issueTimestamp).toJSON() as unknown as Date,
        sender: nft.issuer,
        quantity: nft.quantity,
        reissuable: nft.reissuable,
        hasScript: nft.scripted,
        displayName: nft.name,
        minSponsoredFee: nft.minSponsoredAssetFee ?? undefined,
        originTransactionId: nft.originTransactionId,
        issuer: nft.issuer,
      })),
    };

    this.store.updateState({
      [`balance_${address}`]: balance,
    });
  }

  async updateOtherAccountsBalances() {
    const url = new URL('addresses/balance', this.getNode());
    const addresses = this.getAccounts().map(account => account.address);

    while (addresses.length > 0) {
      const splicedAddresses = addresses.splice(0, 1000);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json; large-significand-format=string',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: splicedAddresses,
        }),
      });

      const regularBalances = (await response.json()) as Array<{
        id: string;
        balance: string;
      }>;

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
