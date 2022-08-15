import { extension } from 'lib/extension';
import ObservableStore from 'obs-store';
import { BigNumber } from '@waves/bignumber';
import { ExtensionStorage } from '../storage/storage';
import { AssetInfoController } from './assetInfo';
import { NftInfoController } from './NftInfoController';
import { NetworkController } from './network';
import { PreferencesController } from './preferences';
import { VaultController } from './VaultController';
import { TransactionFromNode } from '@waves/ts-types';
import { AssetBalance, BalancesItem } from 'balances/types';
import { collectBalances } from 'balances/utils';

export const MAX_TX_HISTORY_ITEMS = 101;
export const MAX_NFT_ITEMS = 1000;
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
      getAccounts().map(acc => [`balance_${acc.address}`, undefined])
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

    extension.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'updateBalances') {
        this.updateBalances();
      }
    });
    this.restartPolling();
  }

  restartPolling() {
    extension.alarms.create('updateBalances', {
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
      this.getNode()
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    const json = (await response.json()) as Array<{
      assetId: string;
      decimals: number;
      description: string;
      issueHeight: number;
      issuer: string;
      issuerPublicKey: string;
      issueTimestamp: number;
      minSponsoredAssetFee: string | null;
      name: string;
      originTransactionId: string;
      quantity: string;
      reissuable: boolean;
      scripted: boolean;
    }>;

    return json;
  }

  async #fetchAliases(address: string) {
    const url = new URL(`alias/by-address/${address}`, this.getNode());

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });

    const json = (await response.json()) as unknown[];

    return json;
  }

  async #fetchTxHistory(address: string) {
    const url = new URL(
      `transactions/address/${address}/limit/${MAX_TX_HISTORY_ITEMS}`,
      this.getNode()
    );

    const response = await fetch(url, {
      headers: {
        accept: 'application/json; large-significand-format=string',
      },
    });

    const json = (await response.json()) as [TransactionFromNode[]];

    return json;
  }

  getAccountBalance() {
    const activeAccount = this.getSelectedAccount();
    const state = this.store.getState();
    const balances = collectBalances(state);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return balances[activeAccount!.address];
  }

  async updateBalances() {
    const currentNetwork = this.getNetwork();
    const accounts = this.getAccounts().filter(
      ({ network }) => network === currentNetwork
    );
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || accounts.length < 1 || !activeAccount) return;

    const state = this.store.getState();
    const oldBalances = collectBalances(state);

    const data = await Promise.all(
      accounts.map(async (account): Promise<[string, BalancesItem] | null> => {
        try {
          const address = account.address;
          const isActiveAddress = address === activeAccount.address;

          const [wavesBalances, myAssets, myNfts, aliases, txHistory] =
            await Promise.all([
              this.#fetchWavesBalance(address),
              ...(isActiveAddress
                ? ([
                    this.#fetchAssetsBalance(address),
                    this.#fetchNfts(address),
                    this.#fetchAliases(address),
                    this.#fetchTxHistory(address),
                  ] as const)
                : []),
            ]);

          if (isActiveAddress) {
            const assets = this.assetInfoController.getAssets();
            const assetExists = (assetId: string) => !!assets[assetId];
            const isMaxAgeExceeded = (assetId: string) =>
              this.assetInfoController.isMaxAgeExceeded(
                assets[assetId] && assets[assetId].lastUpdated
              );

            const isSponsorshipUpdated = (balanceAsset: {
              assetId: string;
              minSponsoredAssetFee: string | null;
            }) =>
              balanceAsset.minSponsoredAssetFee !==
              assets[balanceAsset.assetId].minSponsoredFee;

            const fetchAssetIds = (
              myAssets.balances.filter(
                info =>
                  !assetExists(info.assetId) ||
                  isSponsorshipUpdated(info) ||
                  isMaxAgeExceeded(info.assetId)
              ) as Array<{ assetId: string }>
            )
              .concat(
                myNfts.filter(
                  info =>
                    !assetExists(info.assetId) || isMaxAgeExceeded(info.assetId)
                )
              )
              .map(info => info.assetId)
              .concat(
                txHistory[0]
                  .reduce<string[]>(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (ids, tx: any) => [
                      ...ids,
                      tx.assetId,
                      ...(tx.order1
                        ? [
                            tx.order1.assetPair.amountAsset,
                            tx.order1.assetPair.priceAsset,
                          ]
                        : []),
                      ...(tx.payment
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          tx.payment.map((x: any) => x.assetId)
                        : []),
                      ...(tx.stateChanges
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          tx.stateChanges.transfers.map((x: any) => x.asset)
                        : []),
                    ],
                    []
                  )
                  .filter(
                    assetId =>
                      !!assetId &&
                      !assetExists(assetId) &&
                      isMaxAgeExceeded(assetId)
                  )
              );

            await this.assetInfoController.updateAssets(fetchAssetIds);
            await this.nftInfoController.updateNfts(myNfts);
          }

          const available = new BigNumber(wavesBalances.available);
          const regular = new BigNumber(wavesBalances.regular);
          const leasedOut = regular.sub(available);

          return [
            address,
            {
              ...(isActiveAddress
                ? {
                    aliases: aliases,
                    txHistory: txHistory[0],
                    assets: myAssets.balances.reduce<
                      Record<string, AssetBalance>
                    >(
                      (assets, info) => {
                        assets[info.assetId] = {
                          minSponsoredAssetFee: info.minSponsoredAssetFee,
                          sponsorBalance: info.sponsorBalance,
                          balance: info.balance,
                        };
                        return assets;
                      },
                      {
                        WAVES: {
                          minSponsoredAssetFee: '100000',
                          sponsorBalance: wavesBalances.available,
                          balance: wavesBalances.available,
                        },
                      }
                    ),
                    nfts: myNfts.map(nft => ({
                      id: nft.assetId,
                      name: nft.name,
                      precision: nft.decimals,
                      description: nft.description,
                      height: nft.issueHeight,
                      timestamp: new Date(
                        nft.issueTimestamp
                      ).toJSON() as unknown as Date, // todo fixme please
                      sender: nft.issuer,
                      quantity: nft.quantity,
                      reissuable: nft.reissuable,
                      hasScript: nft.scripted,
                      displayName: nft.name,
                      minSponsoredFee: nft.minSponsoredAssetFee ?? undefined,
                      originTransactionId: nft.originTransactionId,
                      issuer: nft.issuer,
                    })),
                  }
                : oldBalances[address]),
              available: available.toString(),
              leasedOut: leasedOut.toString(),
              network: currentNetwork,
            },
          ];
        } catch (e) {
          return null;
        }
      })
    );

    this.store.updateState(
      Object.fromEntries(
        Object.entries({
          ...oldBalances,
          ...Object.fromEntries(
            data.filter(
              (entry): entry is Exclude<typeof entry, undefined | null> =>
                entry != null
            )
          ),
        }).map(([address, balance]) => [`balance_${address}`, balance])
      )
    );
  }
}
