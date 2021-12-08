import ObservableStore from 'obs-store';
import { BigNumber } from '@waves/bignumber';

export class CurrentAccountController {
  constructor(options = {}) {
    const defaults = {
      balances: {},
      pollInterval: options.pollInterval || 10000,
    };

    this.updateAssets = options.updateAssets;
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
    this.poller = undefined;
    this.restartPolling();
  }

  restartPolling() {
    clearInterval(this.poller);
    const pollInterval = this.store.getState().pollInterval;
    this.poller = setInterval(this.updateBalances.bind(this), pollInterval);
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
    const nftLimit = 1000;
    const txLimit = 100;
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
                      `assets/nft/${address}/limit/${nftLimit}`,
                      `alias/by-address/${address}`,
                      `transactions/address/${address}/limit/${txLimit}`,
                    ]
                  : []),
              ].map(url => this.getByUrl(url))
            );

          if (isActiveAddress) {
            await this.updateAssets(
              address,
              ...(myAssets.balances || [])
                .concat(myNfts || [])
                .map(info => info.assetId)
                .concat(
                  txHistory.map(
                    tx =>
                      tx.assetId ||
                      (tx.order1 &&
                        tx.order1.assetPair &&
                        (tx.order1.assetPair.amountAsset ||
                          tx.order1.assetPair.priceAsset))
                  )
                )
                .filter(assetId => !!assetId)
            );
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
                    aliases: aliases || [],
                    txHistory: txHistory[0],
                    assets: Object.fromEntries(
                      myAssets.balances.map(info => [
                        info.assetId,
                        {
                          minSponsoredAssetFee:
                            info.minSponsoredAssetFee &&
                            new BigNumber(info.minSponsoredAssetFee).toString(),
                          sponsorBalance:
                            info.sponsorBalance &&
                            new BigNumber(info.sponsorBalance).toString(),
                          balance:
                            info.balance &&
                            new BigNumber(info.balance).toString(),
                        },
                      ])
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
      balances: Object.assign({}, oldBalances, Object.fromEntries(data)),
    });
  }
}
