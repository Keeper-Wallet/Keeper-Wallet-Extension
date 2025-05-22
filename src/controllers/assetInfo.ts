import { isNotNull } from '_core/isNotNull';
import { type AssetDetail } from 'assets/types';
import { NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { defaultAssetTickers } from '../assets/constants';
import {
  type ExtensionStorage,
  type StorageLocalState,
} from '../storage/storage';
import { type NetworkController } from './network';
import { type RemoteConfigController } from './remoteConfig';

const WAVES: AssetDetail = {
  quantity: '10000000000000000',
  ticker: 'WAVES',
  id: 'WAVES',
  name: 'Waves',
  precision: 8,
  description: '',
  height: 0,
  issuer: '',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timestamp: '2016-04-11T21:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'WAVES',
};

const SUSPICIOUS_LIST_URL =
  'https://raw.githubusercontent.com/wavesplatform/waves-community/master/Scam%20tokens%20according%20to%20the%20opinion%20of%20Waves%20Community.csv';
const SUSPICIOUS_PERIOD_IN_MINUTES = 60;
const MAX_AGE = 60 * 60 * 1000;

const DATA_SERVICE_URL = 'https://api.keeper-wallet.app';
const SWAP_SERVICE_URL = 'https://swap-api.keeper-wallet.app';

const INFO_PERIOD_IN_MINUTES = 60;
const SWAPPABLE_ASSETS_UPDATE_PERIOD_IN_MINUTES = 240;

function binarySearch<T>(sortedArray: T[], key: T) {
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

interface AssetInfoResponseItem {
  assetId: string;
  name: string;
  decimals: number;
  description: string;
  issueHeight: number;
  issueTimestamp: string;
  issuer: string;
  quantity: string;
  reissuable: boolean;
  scripted: boolean;
  minSponsoredAssetFee: string | null;
  originTransactionId: string;
}

export class AssetInfoController {
  private store;
  private getNode;
  private getNetwork;
  #remoteConfig;

  constructor({
    extensionStorage,
    getNode,
    getNetwork,
    remoteConfig,
  }: {
    extensionStorage: ExtensionStorage;
    getNode: NetworkController['getNode'];
    getNetwork: NetworkController['getNetwork'];
    remoteConfig: RemoteConfigController;
  }) {
    const initState = extensionStorage.getInitState({
      assets: {
        [NetworkName.Mainnet]: {
          WAVES,
        },
        [NetworkName.Stagenet]: {
          WAVES,
        },
        [NetworkName.Testnet]: {
          WAVES,
        },
        [NetworkName.Custom]: {
          WAVES,
        },
      },
      swappableAssetIdsByVendor: {},
      suspiciousAssets: [],
      usdPrices: {},
      assetLogos: {},
      assetTickers: defaultAssetTickers,
    });
    this.store = new ObservableStore(initState);
    extensionStorage.subscribe(this.store);

    this.#remoteConfig = remoteConfig;
    this.getNode = getNode;
    this.getNetwork = getNetwork;

    if (initState.suspiciousAssets.length === 0) {
      this.updateSuspiciousAssets();
    }

    this.updateInfo();
    this.updateSwappableAssetIdsByVendor();

    Browser.alarms.create('updateSuspiciousAssets', {
      periodInMinutes: SUSPICIOUS_PERIOD_IN_MINUTES,
    });
    Browser.alarms.create('updateInfo', {
      periodInMinutes: INFO_PERIOD_IN_MINUTES,
    });
    Browser.alarms.create('updateSwappableAssetIdsByVendor', {
      periodInMinutes: SWAPPABLE_ASSETS_UPDATE_PERIOD_IN_MINUTES,
    });

    Browser.alarms.onAlarm.addListener(({ name }) => {
      switch (name) {
        case 'updateSuspiciousAssets':
          this.updateSuspiciousAssets();
          break;
        case 'updateInfo':
          this.updateInfo();
          break;
        case 'updateSwappableAssetIdsByVendor':
          this.updateSwappableAssetIdsByVendor();
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const asset = assets.mainnet[assetId]!;
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

  isMaxAgeExceeded(lastUpdated: number | undefined) {
    return (
      new Date().getTime() - new Date(lastUpdated || 0).getTime() > MAX_AGE
    );
  }

  isSuspiciousAsset(assetId: string) {
    const { assets, suspiciousAssets } = this.store.getState();
    const network = this.getNetwork();

    return network === NetworkName.Mainnet && suspiciousAssets
      ? binarySearch(suspiciousAssets, assetId) > -1
      : assets[network][assetId]?.isSuspicious;
  }

  async assetInfo(assetId: string | null) {
    const { assets } = this.store.getState();
    const network = this.getNetwork();

    if (
      assetId === '' ||
      assetId == null ||
      assetId.toUpperCase() === 'WAVES'
    ) {
      return assets[network].WAVES;
    }

    const API_BASE = this.getNode();
    const url = new URL(`assets/details/${assetId}`, API_BASE).toString();

    const asset = assets[network] && assets[network][assetId];
    if (!asset || this.isMaxAgeExceeded(asset.lastUpdated)) {
      const resp = await fetch(url);
      switch (resp.status) {
        case 200: {
          const assetInfo = (await resp
            .text()
            .then(text =>
              JSON.parse(
                text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"'),
              ),
            )) as AssetInfoResponseItem;

          assets[network] = assets[network] || {};
          assets[network][assetId] = {
            ...assets[network][assetId],
            ...this.toAssetDetails(assetInfo),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any;
          this.store.updateState({ assets });
          break;
        }
        case 400: {
          const error = await resp.json();
          throw new Error(
            `Could not find info for asset with id: ${assetId}. ${error.message}`,
          );
        }
        default:
          throw new Error(await resp.text());
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return assets[network][assetId]!;
  }

  toAssetDetails(info: AssetInfoResponseItem) {
    const { assetTickers } = this.store.getState();

    return {
      id: info.assetId,
      name: info.name,
      precision: info.decimals,
      description: info.description,
      height: info.issueHeight,
      timestamp: new Date(parseInt(info.issueTimestamp, 10)).toJSON(),
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

  async toggleAssetFavorite(assetId: string) {
    const { assets } = this.store.getState();
    const network = this.getNetwork();
    const asset = assets[network][assetId];

    if (!asset) {
      return;
    }

    asset.isFavorite = !asset.isFavorite;
    this.store.updateState({ assets });
  }

  async #fetchAssetsBatch(nodeUrl: string, assetIds: string[]) {
    if (assetIds.length === 0) return [];

    const response = await fetch(new URL('assets/details', nodeUrl), {
      method: 'POST',
      headers: {
        Accept: 'application/json;large-significand-format=string',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: assetIds }),
    });

    if (!response.ok) {
      throw response;
    }

    const assets: AssetInfoResponseItem[] = await response.json();

    return assets;
  }

  async updateAssets(
    assetIds: Array<string | null | undefined>,
    { ignoreCache }: { ignoreCache?: boolean } = {},
  ) {
    const { assets } = this.store.getState();
    const network = this.getNetwork();

    const assetIdsToFetch = Array.from(
      new Set(
        assetIds
          .filter(isNotNull)
          .filter(id => id !== 'WAVES')
          .filter(assetId => {
            const asset = assets[network][assetId];

            return (
              ignoreCache || !asset || this.isMaxAgeExceeded(asset.lastUpdated)
            );
          }),
      ),
    );

    if (assetIdsToFetch.length === 0) {
      return;
    }

    const { maxAssetsPerRequest } = this.#remoteConfig.getAssetsConfig();

    for (let i = 0; i < assetIdsToFetch.length; i += maxAssetsPerRequest) {
      const assetInfos = await this.#fetchAssetsBatch(
        this.getNode(),
        assetIdsToFetch.slice(i, i + maxAssetsPerRequest),
      );

      assetInfos.forEach(assetInfo => {
        assets[network][assetInfo.assetId] = {
          ...assets[network][assetInfo.assetId],
          ...this.toAssetDetails(assetInfo),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      });

      this.store.updateState({ assets });
    }
  }

  async updateSuspiciousAssets() {
    const { assets, suspiciousAssets } = this.store.getState();
    const network = this.getNetwork();

    if (!suspiciousAssets || network === NetworkName.Mainnet) {
      const resp = await fetch(new URL(SUSPICIOUS_LIST_URL));

      if (resp.ok) {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const suspiciousAssets = (await resp.text()).split('\n').sort();

        if (suspiciousAssets) {
          Object.keys(assets[NetworkName.Mainnet]).forEach(
            assetId =>
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              (assets[NetworkName.Mainnet][assetId]!.isSuspicious =
                binarySearch(suspiciousAssets, assetId) > -1),
          );
        }

        this.store.updateState({ assets, suspiciousAssets });
      }
    }
  }

  async updateUsdPricesByAssetIds(assetIds: string[]) {
    const network = this.getNetwork();

    if (assetIds.length === 0 || network !== NetworkName.Mainnet) {
      return;
    }

    const { usdPrices } = this.store.getState();

    const response = await fetch(new URL('/api/v1/rates', DATA_SERVICE_URL), {
      method: 'POST',
      body: JSON.stringify({ ids: assetIds }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Could not fetch rates [${response.status} ${response.statusText}]: ${error}`,
      );
    }

    const updatedUsdPrices: Record<string, string> = await response.json();

    this.store.updateState({
      usdPrices: {
        ...usdPrices,
        ...updatedUsdPrices,
      },
    });
  }

  async updateInfo() {
    const network = this.getNetwork();

    if (network === NetworkName.Mainnet) {
      const resp = await fetch(new URL('/api/v1/assets', DATA_SERVICE_URL));

      if (resp.ok) {
        const assets = (await resp.json()) as Array<{
          id: string;
          ticker: string;
          url: string;
        }>;

        this.store.updateState(
          assets.reduce(
            (acc, { id, ticker, url }) => ({
              assetLogos: {
                ...acc.assetLogos,
                [id]: url,
              },
              assetTickers: { ...acc.assetTickers, [id]: ticker },
            }),
            {} as {
              assetLogos: StorageLocalState['assetLogos'];
              assetTickers: StorageLocalState['assetTickers'];
            },
          ),
        );
      }
    }
  }

  async updateSwappableAssetIdsByVendor() {
    const resp = await fetch(new URL('/assets', SWAP_SERVICE_URL));
    if (resp.ok) {
      const swappableAssetIdsByVendor = (await resp.json()) as Record<
        string,
        string[]
      >;
      this.store.updateState({ swappableAssetIdsByVendor });
    }
  }
}
