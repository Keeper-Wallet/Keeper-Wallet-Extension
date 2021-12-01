import ObservableStore from 'obs-store';

const WAVES = {
  quantity: '10000000000000000',
  ticker: 'WAVES',
  id: 'WAVES',
  name: 'Waves',
  precision: 8,
  description: '',
  height: 0,
  timestamp: '2016-04-11T21:00:00.000Z',
  sender: '',
  reissuable: false,
  displayName: 'WAVES',
};

export class AssetInfoController {
  constructor(options = {}) {
    const defaults = {
      assets: {
        mainnet: {
          WAVES,
        },
        stagenet: {
          WAVES,
        },
        testnet: {
          WAVES,
        },
        custom: {
          WAVES,
        },
      },
    };
    this.getNode = options.getNode;
    this.getNetwork = options.getNetwork;
    this.getSelectedAccount = options.getSelectedAccount;
    this.store = new ObservableStore(
      Object.assign({}, defaults, options.initState)
    );
  }

  getWavesAsset() {
    return WAVES;
  }

  async assetInfo(assetId, force) {
    const { assets } = this.store.getState();
    if (assetId === '' || assetId == null || assetId.toUpperCase() === 'WAVES')
      return WAVES;

    const network = this.getNetwork();
    const API_BASE = this.getNode();
    const url = new URL(`assets/details/${assetId}`, API_BASE).toString();

    if (
      force ||
      !assets[network] ||
      !assets[network][assetId] ||
      assets[network][assetId].minSponsoredFee === undefined ||
      assets[network][assetId].hasScript === undefined ||
      assets[network][assetId].originTransactionId === undefined
    ) {
      let resp = await fetch(url);
      switch (resp.status) {
        case 200:
          let assetInfo = await resp
            .text()
            .then(text =>
              JSON.parse(
                text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"')
              )
            );
          const mapped = {
            quantity: assetInfo.quantity,
            ticker: assetInfo.ticker,
            id: assetInfo.assetId,
            name: assetInfo.name,
            precision: assetInfo.decimals,
            description: assetInfo.description,
            height: assetInfo.issueHeight,
            timestamp: new Date(parseInt(assetInfo.issueTimestamp)).toJSON(),
            sender: assetInfo.issuer,
            hasScript: assetInfo.scripted,
            reissuable: assetInfo.reissuable,
            displayName: assetInfo.ticker || assetInfo.name,
            minSponsoredFee: assetInfo.minSponsoredAssetFee,
            originTransactionId: assetInfo.originTransactionId,
          };
          assets[network] = assets[network] || {};
          assets[network][assetId] = mapped;
          this.store.updateState({ assets });
          break;
        case 400:
          const error = await resp.json();
          throw new Error(
            `Could not find info for asset with id: ${assetId}. ${error.message}`
          );
        default:
          throw new Error(await resp.text());
      }
    }

    return assets[network][assetId];
  }

  async nftInfo(address, limit = 1000) {
    let resp = await fetch(
      new URL(`assets/nft/${address}/limit/${limit}`, this.getNode()).toString()
    );
    switch (resp.status) {
      case 200:
        let nfts = await resp
          .text()
          .then(text =>
            JSON.parse(
              text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"')
            )
          );
        return nfts.map(nft => ({
          id: nft.assetId,
          name: nft.name,
          precision: nft.decimals,
          description: nft.description,
          height: nft.issueHeight,
          timestamp: new Date(parseInt(nft.issueTimestamp)).toJSON(),
          sender: nft.issuer,
          quantity: nft.quantity,
          reissuable: nft.reissuable,
          hasScript: nft.scripted,
          displayName: nft.ticker || nft.name,
          minSponsoredFee: nft.minSponsoredAssetFee,
          originTransactionId: nft.originTransactionId,
          issuer: nft.issuer,
        }));
      default:
        throw new Error(await resp.text());
    }
  }
}
