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
const HOUR = 60 * 60 * 1000;
const SUSPICIOUS_LIST_URL =
  'https://raw.githubusercontent.com/wavesplatform/waves-community/master/Scam%20tokens%20according%20to%20the%20opinion%20of%20Waves%20Community.csv';

export class AssetInfoController {
  constructor(options = {}) {
    const defaults = {
      lastUpdated: {
        mainnet: {},
        stagenet: {},
        testnet: {},
        custom: {},
        suspicious: null,
      },
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
        suspicious: [],
      },
    };
    this.getNode = options.getNode;
    this.getNetwork = options.getNetwork;
    this.store = new ObservableStore(
      Object.assign({}, defaults, options.initState)
    );
  }

  getWavesAsset() {
    return WAVES;
  }

  async assetInfo(assetId, compareFields = {}) {
    await this.updateSuspiciousAssets();

    const { assets } = this.store.getState();
    if (assetId === '' || assetId == null || assetId.toUpperCase() === 'WAVES')
      return WAVES;

    const network = this.getNetwork();
    const API_BASE = this.getNode();
    const url = new URL(`assets/details/${assetId}`, API_BASE).toString();

    const asset = assets[network] && assets[network][assetId];
    // fetch information about the asset if one of the compared fields
    // is not equal to the value from the storage
    const force =
      Object.keys(compareFields).length !== 0 &&
      Object.keys(asset || {}).reduce((prev, field) => {
        // != because sometimes compare field value mismatches asset field type
        return prev && compareFields[field] != asset[field];
      }, false);

    if (
      force ||
      !asset ||
      asset.minSponsoredFee === undefined ||
      assets[network][assetId].hasScript === undefined ||
      assets[network][assetId].originTransactionId === undefined ||
      assets[network][assetId].issuer === undefined
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
            issuer: assetInfo.issuer,
            isSuspicious:
              network === 'mainnet' &&
              assets.suspicious.includes(assetInfo.assetId),
          };
          assets[network] = assets[network] || {};
          assets[network][assetId] = { ...assets[network][assetId], ...mapped };
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

  async assetFavorite(assetId) {
    const { assets } = this.store.getState();
    const network = this.getNetwork();
    const asset = assets[network] && assets[network][assetId];

    if (!asset) {
      return;
    }

    assets[network][assetId].isFavorite = !asset.isFavorite;
    this.store.updateState({ assets });
  }

  /**
   * Force-updates storage asset info by assetId list
   * @param {string} forAddress
   * @param {Array<string>} assetIds
   * @returns {Promise<void>}
   */
  async updateAssets(forAddress, assetIds) {
    await this.updateSuspiciousAssets();

    const { assets, lastUpdated } = this.store.getState();
    const network = this.getNetwork();

    let fetchIds =
      new Date() - new Date(lastUpdated[network][forAddress]) < HOUR
        ? assetIds.filter(id => assets[network][id] == null)
        : assetIds;

    if (fetchIds.length === 0) {
      return;
    }

    let resp = await fetch(
      new URL(`assets/details`, this.getNode()).toString(),
      {
        method: 'POST',
        headers: {
          Accept: 'application/json;large-significand-format=string',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: fetchIds }),
      }
    );

    switch (resp.status) {
      case 200:
        let assetInfos = await resp.json();

        assetInfos.forEach(assetInfo => {
          if (!assetInfo.error) {
            assets[network][assetInfo.assetId] = {
              ...assets[network][assetInfo.assetId],
              id: assetInfo.assetId,
              name: assetInfo.name,
              precision: assetInfo.decimals,
              description: assetInfo.description,
              height: assetInfo.issueHeight,
              timestamp: new Date(parseInt(assetInfo.issueTimestamp)).toJSON(),
              sender: assetInfo.issuer,
              quantity: assetInfo.quantity,
              reissuable: assetInfo.reissuable,
              hasScript: assetInfo.scripted,
              displayName: assetInfo.ticker || assetInfo.name,
              minSponsoredFee: assetInfo.minSponsoredAssetFee,
              originTransactionId: assetInfo.originTransactionId,
              issuer: assetInfo.issuer,
              isSuspicious:
                network === 'mainnet' &&
                assets.suspicious.includes(assetInfo.assetId),
            };
          }
        });
        lastUpdated[network][forAddress] = new Date().getTime();
        this.store.updateState({ assets, lastUpdated });
        break;
      default:
        throw new Error(await resp.text());
    }
  }

  async updateSuspiciousAssets() {
    let { assets, lastUpdated } = this.store.getState();
    const network = this.getNetwork();

    if (
      network === 'mainnet' &&
      new Date() - new Date(lastUpdated.suspicious) > HOUR
    ) {
      const resp = await fetch(new URL(SUSPICIOUS_LIST_URL));
      switch (resp.status) {
        case 200:
          const suspicious = (await resp.text()).split('\n');
          assets.suspicious = suspicious;
          lastUpdated.suspicious = new Date().getTime();
          break;
        default:
          throw new Error(await resp.text());
      }
    }

    Object.keys(assets[network]).forEach(
      assetId =>
        (assets[network][assetId].isSuspicious =
          assets.suspicious.includes(assetId))
    );
    this.store.updateState({ assets, lastUpdated });
  }
}
