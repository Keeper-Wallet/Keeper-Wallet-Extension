import { extension } from 'lib/extension';
import ObservableStore from 'obs-store';
import { BigNumber } from '@waves/bignumber';
import ExtensionStore from 'lib/localStore';
import { AssetInfoController } from './assetInfo';
import { NftInfoController } from './NftInfoController';
import { WalletController } from './wallet';
import { NetworkController } from './network';
import { PreferencesController } from './preferences';
import { VaultController } from './VaultController';
import { TransactionFromNode } from '@waves/ts-types';
import { AssetBalance, BalancesItem } from 'balances/types';

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
    localStore,
    assetInfoController,
    nftInfoController,
    getAccounts,
    getNetwork,
    getNode,
    getSelectedAccount,
    isLocked,
  }: {
    localStore: ExtensionStore;
    assetInfoController: AssetInfoController;
    nftInfoController: NftInfoController;
    getAccounts: WalletController['getAccounts'];
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
    getSelectedAccount: PreferencesController['getSelectedAccount'];
    isLocked: VaultController['isLocked'];
  }) {
    this.store = new ObservableStore(localStore.getInitState({ balances: {} }));
    localStore.subscribe(this.store);

    this.assetInfoController = assetInfoController;
    this.nftInfoController = nftInfoController;
    this.getAccounts = getAccounts;
    this.getNetwork = getNetwork;
    this.getNode = getNode;
    this.getSelectedAccount = getSelectedAccount;
    this.isLocked = isLocked;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extension.alarms.onAlarm.addListener(({ name }: any) => {
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

  getByUrl(url: string) {
    let accept = 'application/json;';
    if (url.match(/^(assets|transactions)/))
      accept += 'large-significand-format=string';
    return fetch(new URL(url, this.getNode()).toString(), {
      headers: { accept },
    }).then(resp => resp.json());
  }

  getAccountBalance() {
    const activeAccount = this.getSelectedAccount();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.store.getState().balances[activeAccount!.address];
  }

  async updateBalances() {
    const currentNetwork = this.getNetwork();
    const accounts = this.getAccounts().filter(
      ({ network }) => network === currentNetwork
    );
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || accounts.length < 1) return;

    const oldBalances = this.store.getState().balances;
    const data = await Promise.all(
      accounts.map(async (account): Promise<[string, BalancesItem] | null> => {
        try {
          const address = account.address;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const isActiveAddress = address === activeAccount!.address;

          const [wavesBalances, myAssets, myNfts, aliases, txHistory] =
            (await Promise.all(
              [
                `addresses/balance/details/${address}`,
                ...(isActiveAddress
                  ? [
                      `assets/balance/${address}`,
                      `assets/nft/${address}/limit/${MAX_NFT_ITEMS}`,
                      `alias/by-address/${address}`,
                      `transactions/address/${address}/limit/${MAX_TX_HISTORY_ITEMS}`,
                    ]
                  : []),
              ].map(url => this.getByUrl(url))
            )) as [
              { available: string; regular: string },
              {
                address: string;
                balances: Array<{
                  assetId: string;
                  balance: string;
                  minSponsoredAssetFee: string | null;
                  sponsorBalance: string;
                }>;
              },
              Array<{
                assetId: string;
                decimals: number;
                description: string;
                issueHeight: string;
                issuer: string;
                issuerPublicKey: string;
                issueTimestamp: number;
                minSponsoredAssetFee: string | null;
                name: string;
                originTransactionId: string;
                quantity: string;
                reissuable: boolean;
                scripted: boolean;
              }>,
              unknown[],
              [TransactionFromNode[]]
            ];

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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        parseInt(nft.issueTimestamp as any)
                      ).toJSON(),
                      sender: nft.issuer,
                      quantity: nft.quantity,
                      reissuable: nft.reissuable,
                      hasScript: nft.scripted,
                      displayName: nft.name,
                      minSponsoredFee: nft.minSponsoredAssetFee,
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

    this.store.updateState({
      balances: Object.assign(
        {},
        oldBalances,
        Object.fromEntries<BalancesItem>(
          data.filter(
            (entry): entry is Exclude<typeof entry, undefined | null> =>
              entry != null
          )
        )
      ),
    });
  }
}
