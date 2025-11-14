import { isNotNull } from '_core/isNotNull';
import { type AssetDetail, type AssetsRecord } from 'assets/types';
import { getDataServiceUrl, getSwapServiceUrl } from 'config/env';
import {
  type Unit0NftAsset,
  type Unit0TokenAsset,
} from './strategies/interfaces/IUnit0Types';

type Unit0AssetMetadata =
  | Unit0TokenAsset['metadata']
  | Unit0NftAsset['metadata'];
import { NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { Unit0Api } from './api/unit0Api';

import { defaultAssetTickers } from '../assets/constants';
import {
  type ExtensionStorage,
  type StorageLocalState,
} from '../storage/storage';
import { type NetworkController } from './network';
import { type RemoteConfigController } from './remoteConfig';

export const WAVES: AssetDetail = {
  quantity: '10000000000000000',
  ticker: 'WAVES',
  id: 'WAVES',
  name: 'Waves',
  precision: 8,
  description: '',
  height: 0,
  issuer: '',
  timestamp: new Date('2016-04-11T21:00:00.000Z'),
  sender: '',
  reissuable: false,
  displayName: 'WAVES',
};

const UNIT0: AssetDetail = {
  quantity: '10000000000000000',
  ticker: 'UNIT0',
  id: 'unit0',
  name: 'Unit0',
  precision: 18,
  description: 'Unit0 native token',
  height: 0,
  issuer: '',
  timestamp: new Date('2024-01-01T00:00:00.000Z'),
  sender: '',
  reissuable: false,
  displayName: 'UNIT0',
};

const SUSPICIOUS_LIST_URL =
  'https://raw.githubusercontent.com/wavesplatform/waves-community/master/Scam%20tokens%20according%20to%20the%20opinion%20of%20Waves%20Community.csv';
const SUSPICIOUS_PERIOD_IN_MINUTES = 60;
const MAX_AGE = 60 * 60 * 1000;

// const DATA_SERVICE_URL = 'https://api.keeper-wallet.app';

const DATA_SERVICE_URL = getDataServiceUrl();
const SWAP_SERVICE_URL = getSwapServiceUrl();

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
  private unit0Api: Unit0Api;

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
          unit0: UNIT0,
        },
        [NetworkName.Stagenet]: {
          WAVES,
        },
        [NetworkName.Testnet]: {
          WAVES,
          unit0: UNIT0,
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

    this.ensureUnit0AssetExists();

    this.#remoteConfig = remoteConfig;
    this.getNode = getNode;
    this.getNetwork = getNetwork;
    this.unit0Api = new Unit0Api();

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

  private async ensureUnit0AssetExists() {
    const state = this.store.getState();
    const assets = { ...state.assets };
    let needsUpdate = false;

    // Only ensure Unit0 native token exists - ERC-20 tokens will be handled dynamically
    // Check if Unit0 native token exists in mainnet
    if (!assets[NetworkName.Mainnet].unit0) {
      assets[NetworkName.Mainnet].unit0 = UNIT0;
      needsUpdate = true;
    }

    // Check if Unit0 native token exists in testnet
    if (!assets[NetworkName.Testnet].unit0) {
      assets[NetworkName.Testnet].unit0 = UNIT0;
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.store.updateState({ assets });
    }
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

  getAssets(): AssetsRecord {
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
          };
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
        };
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

  /**
   * Update USD prices for Unit0 tokens by their IDs
   * @param ids - Array of Unit0 token IDs ("UNIT0" for native, contract addresses for ERC-20)
   */
  async updateUnit0UsdPricesByIds(ids: string[]) {
    const network = this.getNetwork();

    // Only fetch prices for Unit0 mainnet
    if (ids.length === 0 || network !== NetworkName.Mainnet) {
      return;
    }

    const { usdPrices } = this.store.getState();

    try {
      // Fetch prices from Unit0 price API
      const unit0Prices = await this.unit0Api.fetchPricesByIds(ids);

      // Convert Unit0 price format to the format used in the store
      const updatedUsdPrices: Record<string, string> = {};

      for (const [id, priceData] of Object.entries(unit0Prices)) {
        // Normalize to lowercase for consistency (except "UNIT0" which stays uppercase)
        const normalizedId = id === 'UNIT0' ? id : id.toLowerCase();
        updatedUsdPrices[normalizedId] = priceData.price_usd.toString();
      }

      // Merge with existing prices
      this.store.updateState({
        usdPrices: {
          ...usdPrices,
          ...updatedUsdPrices,
        },
      });
    } catch (error) {
      console.error('Failed to fetch Unit0 prices:', error);
      // Don't throw - allow the app to continue even if price fetch fails
    }
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

  async storeUnit0TokenMetadata(
    contractAddress: string,
    metadata: Unit0AssetMetadata,
  ) {
    const state = this.store.getState();
    const assets = { ...state.assets };

    // Create asset object from dynamic metadata
    const assetDetail: AssetDetail = {
      id: contractAddress,
      name: metadata.symbol || contractAddress, // Use symbol as name for consistency
      displayName: metadata.name, // Full name for display
      ticker: metadata.symbol,
      type: metadata.type,
      precision: Number(metadata.decimals) || 18,
      description: '',
      height: 0,
      timestamp: new Date(),
      sender: '',
      issuer: 'issuer' in metadata ? metadata.issuer : '',
      quantity: 1,
      reissuable: false,
    };

    // Store in both mainnet and testnet for consistency
    if (!assets[NetworkName.Mainnet][contractAddress]) {
      assets[NetworkName.Mainnet][contractAddress] = assetDetail;
    }
    if (!assets[NetworkName.Testnet][contractAddress]) {
      assets[NetworkName.Testnet][contractAddress] = assetDetail;
    }

    // Update Redux store
    this.store.updateState({ assets });

    // Also store logo if available
    if ('icon_url' in metadata && metadata.icon_url) {
      const currentState = this.store.getState();
      const logos = { ...currentState.assetLogos };

      // Store logo for contract address key
      logos[contractAddress] = metadata.icon_url;

      this.store.updateState({ assetLogos: logos });
    }
  }
}
