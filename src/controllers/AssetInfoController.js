import ObservableStore from 'obs-store';
import * as R from 'ramda';

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
const SUSPICIOUS_LIST_URL =
  'https://raw.githubusercontent.com/wavesplatform/waves-community/master/Scam%20tokens%20according%20to%20the%20opinion%20of%20Waves%20Community.csv';
const MAX_AGE = 60 * 60 * 1000;

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
    this.suspiciousAssets = undefined;
    this.suspiciousLastUpdated = 0;

    this.getNode = options.getNode;
    this.getNetwork = options.getNetwork;
    this.store = new ObservableStore(
      Object.assign({}, defaults, options.initState)
    );
    this.updateSuspiciousAssets();
  }

  getWavesAsset() {
    return WAVES;
  }

  getAssets() {
    return this.store.getState().assets[this.getNetwork()];
  }

  isMaxAgeExceeded(lastUpdated) {
    return new Date() - new Date(lastUpdated || 0) > MAX_AGE;
  }

  isSuspiciousAsset(assetId) {
    const { assets } = this.store.getState();
    const network = this.getNetwork();
    const asset = assets[network][assetId] || {};

    return network === 'mainnet' && this.suspiciousAssets
      ? R.includes(this.suspiciousAssets, assetId)
      : asset.isSuspicious;
  }

  async assetInfo(assetId) {
    await this.updateSuspiciousAssets();

    const { assets } = this.store.getState();
    if (assetId === '' || assetId == null || assetId.toUpperCase() === 'WAVES')
      return WAVES;

    const network = this.getNetwork();
    const API_BASE = this.getNode();
    const url = new URL(`assets/details/${assetId}`, API_BASE).toString();

    const asset = assets[network] && assets[network][assetId];
    if (!asset || this.isMaxAgeExceeded(asset.lastUpdated)) {
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
            isSuspicious: this.isSuspiciousAsset(assetInfo.assetId),
            lastUpdated: new Date().getTime(),
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

  async toggleAssetFavorite(assetId) {
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
   * @param {Array<string>} assetIds
   * @returns {Promise<void>}
   */
  async updateAssets(assetIds) {
    await this.updateSuspiciousAssets();

    const { assets } = this.store.getState();
    const network = this.getNetwork();

    if (assetIds.length === 0) {
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
        body: JSON.stringify({ ids: assetIds }),
      }
    );

    switch (resp.status) {
      case 200:
        let assetInfos = await resp.json();
        const lastUpdated = new Date().getTime();

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
              isSuspicious: this.isSuspiciousAsset(assetInfo.assetId),
              lastUpdated,
            };
          }
        });
        assets[network]['WAVES'] = this.getWavesAsset();
        this.store.updateState({ assets });
        break;
      default:
        throw new Error(await resp.text());
    }
  }

  async updateSuspiciousAssets() {
    let { assets } = this.store.getState();
    const network = this.getNetwork();

    if (
      !this.suspiciousAssets ||
      (network === 'mainnet' &&
        new Date() - new Date(this.suspiciousLastUpdated) > MAX_AGE)
    ) {
      const resp = await fetch(new URL(SUSPICIOUS_LIST_URL));
      switch (resp.status) {
        case 200:
          this.suspiciousAssets = (await resp.text()).split('\n');
          this.suspiciousLastUpdated = new Date().getTime();
          break;
        default:
          throw new Error(await resp.text());
      }
    }

    if (this.suspiciousAssets) {
      R.forEach(
        assetId =>
          (assets[network][assetId].isSuspicious = R.includes(
            this.suspiciousAssets,
            assetId
          )),
        R.keys(assets[network])
      );
    }

    this.store.updateState({ assets });
  }
}
