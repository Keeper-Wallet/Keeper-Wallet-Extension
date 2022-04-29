import { extension } from 'lib/extension';
import ObservableStore from 'obs-store';
import { BigNumber } from '@waves/bignumber';

export const MAX_TX_HISTORY_ITEMS = 101;
const MAX_NFT_ITEMS = 1000;
const PERIOD_IN_SECONDS = 10000;

export class CurrentAccountController {
  constructor(options = {}) {
    const defaults = {
      balances: {},
    };

    this.assetInfoController = options.assetInfoController;
    this.getNetworkConfig = options.getNetworkConfig;
    this.getAccounts = options.getAccounts;
    this.getNetwork = options.getNetwork;
    this.getNode = options.getNode;
    this.getCode = options.getCode;
    this.getSelectedAccount = options.getSelectedAccount;
    this.isLocked = options.isLocked;
    this.store = new ObservableStore(
      Object.assign({}, defaults, options.initState)
    );

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

  getByUrl(url) {
    let accept = 'application/json;';
    if (url.match(/^(assets|transactions)/))
      accept += 'large-significand-format=string';
    return fetch(new URL(url, this.getNode()).toString(), {
      headers: { accept },
    }).then(resp => resp.json());
  }

  async updateBalances() {
    const currentNetwork = this.getNetwork();
    const accounts = this.getAccounts().filter(
      ({ network }) => network === currentNetwork
    );
    const activeAccount = this.getSelectedAccount();

    if (this.isLocked() || accounts.length < 1) return;

    const data = await Promise.all(
      accounts.map(async account => {
        try {
          const address = account.address;
          const isActiveAddress = address === activeAccount.address;

          const [wavesBalances, myAssets, myNfts, aliases, txHistory] =
            await Promise.all(
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
            );

          if (isActiveAddress) {
            const assets = this.assetInfoController.getAssets();
            const assetExists = assetId => !!assets[assetId];
            const isMaxAgeExceeded = assetId =>
              this.assetInfoController.isMaxAgeExceeded(
                assets[assetId] && assets[assetId].lastUpdated
              );

            const isSponsorshipUpdated = balanceAsset =>
              balanceAsset.minSponsoredAssetFee !==
              assets[balanceAsset.assetId].minSponsoredFee;

            const fetchAssetIds = myAssets.balances
              .filter(
                info =>
                  !assetExists(info.assetId) ||
                  isSponsorshipUpdated(info) ||
                  isMaxAgeExceeded(info.assetId)
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
                  .reduce(
                    (ids, tx) => [
                      ...ids,
                      tx.assetId,
                      ...(tx.order1
                        ? [
                            tx.order1.assetPair.amountAsset,
                            tx.order1.assetPair.priceAsset,
                          ]
                        : []),
                      ...(tx.payment ? tx.payment.map(x => x.assetId) : []),
                      ...(tx.stateChanges
                        ? tx.stateChanges.transfers.map(x => x.asset)
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
          }

          const available = new BigNumber(wavesBalances.available);
          const regular = new BigNumber(wavesBalances.regular);
          const leasedOut = regular.sub(available);

          return [
            address,
            {
              available: available.toString(),
              leasedOut: leasedOut.toString(),
              network: currentNetwork,
              ...(isActiveAddress
                ? {
                    aliases: aliases,
                    txHistory: txHistory[0],
                    assets: myAssets.balances.reduce(
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
                        parseInt(nft.issueTimestamp)
                      ).toJSON(),
                      sender: nft.issuer,
                      quantity: nft.quantity,
                      reissuable: nft.reissuable,
                      hasScript: nft.scripted,
                      displayName: nft.ticker || nft.name,
                      minSponsoredFee: nft.minSponsoredAssetFee,
                      originTransactionId: nft.originTransactionId,
                      issuer: nft.issuer,
                    })),
                  }
                : undefined),
            },
          ];
        } catch (e) {
          return null;
        }
      })
    );

    const oldBalances = this.store.getState().balances;
    this.store.updateState({
      balances: Object.assign(
        {},
        oldBalances,
        Object.fromEntries(data.filter(entry => entry != null))
      ),
    });
  }
}
