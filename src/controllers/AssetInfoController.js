import { extension } from 'lib/extension';
import ObservableStore from 'obs-store';
import { NetworkName } from '../accounts/types';

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
const SUSPICIOUS_PERIOD_IN_MINUTES = 60;
const MAX_AGE = 60 * 60 * 1000;

const MARKETDATA_URL = 'https://marketdata.wavesplatform.com/';
const MARKETDATA_USD_ASSET_ID = 'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p';
const MARKETDATA_PERIOD_IN_MINUTES = 10;

const STATIC_SERVICE_URL = 'https://static.keeper-wallet.app/';
const INFO_PERIOD_IN_MINUTES = 240;

const stablecoinAssetIds = new Set([
  '2thtesXvnVMcCnih9iZbJL3d2NQZMfzENJo8YFj6r5jU',
  '34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ',
  '6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ',
  '8DLiYZjo3UUaRBTHU7Ayoqg4ihwb6YH1AfXrrhdjQ7K1',
  '8zUYbdB8Q6mDhpcXYv52ji8ycfj4SDX4gJXS7YY3dA4R',
  'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p',
]);

function binarySearch(sortedArray, key) {
  let start = 0;
  let end = sortedArray.length - 1;

  while (start <= end) {
    const middle = Math.floor((start + end) / 2);

    if (sortedArray[middle] === key) {
      return middle;
    } else if (sortedArray[middle] < key) {
      start = middle + 1;
    } else {
      end = middle - 1;
    }
  }

  return -1;
}

export class AssetInfoController {
  constructor({ localStore, getNode, getNetwork }) {
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
      suspiciousAssets: [],
      usdPrices: {},
      assetLogos: {},
      assetTickers: {},
    };
    const initState = localStore.getInitState(defaults);
    this.store = new ObservableStore(initState);
    localStore.subscribe(this.store);

    this.getNode = getNode;
    this.getNetwork = getNetwork;

    if (initState.suspiciousAssets.length === 0) {
      this.updateSuspiciousAssets();
    }

    if (Object.keys(initState.usdPrices).length === 0) {
      this.updateUsdPrices();
    }

    if (
      Object.keys(initState.assetLogos).length === 0 ||
      Object.keys(initState.assetTickers).length === 0
    ) {
      this.updateInfo();
    }

    extension.alarms.create('updateSuspiciousAssets', {
      periodInMinutes: SUSPICIOUS_PERIOD_IN_MINUTES,
    });
    extension.alarms.create('updateUsdPrices', {
      periodInMinutes: MARKETDATA_PERIOD_IN_MINUTES,
    });
    extension.alarms.create('updateInfo', {
      periodInMinutes: INFO_PERIOD_IN_MINUTES,
    });

    extension.alarms.onAlarm.addListener(({ name }) => {
      switch (name) {
        case 'updateSuspiciousAssets':
          this.updateSuspiciousAssets();
          break;
        case 'updateUsdPrices':
          this.updateUsdPrices();
          break;
        case 'updateInfo':
          this.updateInfo();
          break;
        default:
          break;
      }
    });
  }

  addTickersForExistingAssets() {
    const { assets, assetTickers } = this.store.getState();

    const assetIdsToUpdate = Object.keys(assetTickers).filter(assetId => {
      const asset = assets.mainnet[assetId];
      const ticker = assetTickers[assetId];

      return asset && (asset.displayName !== ticker || asset.ticker !== ticker);
    });

    if (assetIdsToUpdate.length !== 0) {
      assetIdsToUpdate.forEach(assetId => {
        const asset = assets.mainnet[assetId];
        const ticker = assetTickers[assetId];

        asset.displayName = asset.ticker = ticker;
      });

      this.store.updateState({ assets });
    }
  }

  getWavesAsset() {
    return WAVES;
  }

  getAssets() {
    return this.store.getState().assets[this.getNetwork()];
  }

  getUsdPrices() {
    return this.store.getState().usdPrices;
  }

  isMaxAgeExceeded(lastUpdated) {
    return new Date() - new Date(lastUpdated || 0) > MAX_AGE;
  }

  isSuspiciousAsset(assetId) {
    const { assets, suspiciousAssets } = this.store.getState();
    const network = this.getNetwork();
    const asset = assets[network][assetId] || {};

    return network === NetworkName.Mainnet && suspiciousAssets
      ? binarySearch(suspiciousAssets, assetId) > -1
      : asset.isSuspicious;
  }

  async assetInfo(assetId) {
    const { assets } = this.store.getState();
    const network = this.getNetwork();

    if (
      assetId === '' ||
      assetId == null ||
      assetId.toUpperCase() === 'WAVES'
    ) {
      return assets[network]['WAVES'];
    }

    const API_BASE = this.getNode();
    const url = new URL(`assets/details/${assetId}`, API_BASE).toString();

    const asset = assets[network] && assets[network][assetId];
    if (!asset || this.isMaxAgeExceeded(asset.lastUpdated)) {
      const resp = await fetch(url);
      switch (resp.status) {
        case 200: {
          const assetInfo = await resp
            .text()
            .then(text =>
              JSON.parse(
                text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"')
              )
            );
          assets[network] = assets[network] || {};
          assets[network][assetId] = {
            ...assets[network][assetId],
            ...this.toAssetDetails(assetInfo),
          };
          this.store.updateState({ assets });
          break;
        }
        case 400: {
          const error = await resp.json();
          throw new Error(
            `Could not find info for asset with id: ${assetId}. ${error.message}`
          );
        }
        default:
          throw new Error(await resp.text());
      }
    }

    return assets[network][assetId];
  }

  toAssetDetails(info) {
    const { assetTickers } = this.store.getState();

    return {
      id: info.assetId,
      name: info.name,
      precision: info.decimals,
      description: info.description,
      height: info.issueHeight,
      timestamp: new Date(parseInt(info.issueTimestamp)).toJSON(),
      sender: info.issuer,
      quantity: info.quantity,
      reissuable: info.reissuable,
      hasScript: info.scripted,
      ticker: assetTickers[info.assetId],
      displayName: assetTickers[info.assetId] || info.name,
      minSponsoredFee: info.minSponsoredAssetFee,
      originTransactionId: info.originTransactionId,
      issuer: info.issuer,
      isSuspicious: this.isSuspiciousAsset(info.assetId),
      lastUpdated: new Date().getTime(),
    };
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
    const { assets } = this.store.getState();
    const network = this.getNetwork();

    if (assetIds.length === 0) {
      return;
    }

    const resp = await fetch(
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
      case 200: {
        const assetInfos = await resp.json();

        assetInfos.forEach(assetInfo => {
          if (!assetInfo.error) {
            assets[network][assetInfo.assetId] = {
              ...assets[network][assetInfo.assetId],
              ...this.toAssetDetails(assetInfo),
            };
          }
        });
        this.store.updateState({ assets });
        break;
      }
      default:
        throw new Error(await resp.text());
    }
  }

  async updateSuspiciousAssets() {
    const { assets, suspiciousAssets } = this.store.getState();
    const network = this.getNetwork();

    if (!suspiciousAssets || network === NetworkName.Mainnet) {
      const resp = await fetch(new URL(SUSPICIOUS_LIST_URL));

      if (resp.ok) {
        const suspiciousAssets = (await resp.text()).split('\n').sort();

        if (suspiciousAssets) {
          Object.keys(assets[NetworkName.Mainnet]).forEach(
            assetId =>
              (assets[NetworkName.Mainnet][assetId].isSuspicious =
                binarySearch(suspiciousAssets, assetId) > -1)
          );
        }

        this.store.updateState({ assets, suspiciousAssets });
      }
    }
  }

  async updateUsdPrices() {
    const { usdPrices } = this.store.getState();
    const network = this.getNetwork();

    if (!usdPrices || network === NetworkName.Mainnet) {
      const resp = await fetch(new URL('/api/tickers', MARKETDATA_URL));

      if (resp.ok) {
        const tickers = await resp.json();
        const usdPrices = tickers.reduce((acc, ticker) => {
          if (
            !stablecoinAssetIds.has(ticker.amountAssetID) &&
            ticker.priceAssetID === MARKETDATA_USD_ASSET_ID
          ) {
            acc[ticker.amountAssetID] = ticker['24h_close'];
          }

          return acc;
        }, {});

        stablecoinAssetIds.forEach(ticker => {
          usdPrices[ticker] = '1';
        });

        this.store.updateState({ usdPrices });
      }
    }
  }

  async updateInfo() {
    const network = this.getNetwork();

    if (network === NetworkName.Mainnet) {
      const resp = await fetch(new URL('/assets', STATIC_SERVICE_URL));

      if (resp.ok) {
        const assets = await resp.json();

        this.store.updateState(
          assets.reduce(
            (acc, { id, ticker, uri }) => ({
              assetLogos: {
                ...acc.assetLogos,
                [id]: `${STATIC_SERVICE_URL}${uri}`,
              },
              assetTickers: { ...acc.assetTickers, [id]: ticker },
            }),
            {}
          )
        );
      }
    }
  }
}
