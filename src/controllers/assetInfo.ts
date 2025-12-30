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

import {
  assetLogosByNetwork,
  defaultAssetTickers,
  unit0AssetLogosByNetwork,
} from '../assets/constants';
import {
  type ExtensionStorage,
  type StorageLocalState,
} from '../storage/storage';
import { Unit0Api } from './api/unit0Api';
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
  timestamp: new Date('2016-04-11T21:00:00.000Z').toJSON(),
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
  timestamp: new Date('2024-01-01T00:00:00.000Z').toJSON(),
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

async function fetchIconAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok || response.status >= 400) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return null;
    }

    const blob = await response.blob();

    return await new Promise<string | null>(resolve => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve(null);
        }
      };

      reader.onerror = () => resolve(null);

      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

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

  private seedDefaultLogosFromConstants(network: NetworkName) {
    const { assetLogos, assets } = this.store.getState();

    const networkAssetLogos =
      (assetLogosByNetwork[network] as Record<string, string> | undefined) ||
      {};
    const networkUnit0AssetLogos =
      (unit0AssetLogosByNetwork[network] as
        | Record<string, string>
        | undefined) || {};

    const allDefaultLogos = {
      ...(networkAssetLogos as Record<string, string>),
      ...(networkUnit0AssetLogos as Record<string, string>),
    };

    const updatedAssetLogos: StorageLocalState['assetLogos'] = {
      ...assetLogos,
    };

    // 1. Ensure existing user assets have logos (handling case sensitivity for Unit0)
    const networkAssets = assets[network] || {};
    Object.keys(networkAssets).forEach(assetId => {
      if (updatedAssetLogos[assetId]) {
        return;
      }

      // Try direct lookup
      if (allDefaultLogos[assetId]) {
        updatedAssetLogos[assetId] = allDefaultLogos[assetId];
        return;
      }

      // Try case-insensitive lookup for Unit0 (0x...)
      if (assetId.startsWith('0x')) {
        const lowercasedId = assetId.toLowerCase();
        if (allDefaultLogos[lowercasedId]) {
          updatedAssetLogos[assetId] = allDefaultLogos[lowercasedId];
        }
      }
    });

    // 2. Populate all other default logos (mostly lowercase keys from constants)
    Object.entries(allDefaultLogos).forEach(([assetId, logoUrl]) => {
      if (!updatedAssetLogos[assetId]) {
        updatedAssetLogos[assetId] = logoUrl;
      }
    });

    if (
      Object.keys(updatedAssetLogos).length === Object.keys(assetLogos).length
    ) {
      return;
    }

    this.store.updateState({ assetLogos: updatedAssetLogos });
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
          // Filter out WAVES since it's the native token and doesn't have an asset ID
          // The API will return an error if we try to fetch it
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
      const batchIds = assetIdsToFetch.slice(i, i + maxAssetsPerRequest);
      try {
        const assetInfos = await this.#fetchAssetsBatch(
          this.getNode(),
          batchIds,
        );

        assetInfos.forEach(assetInfo => {
          assets[network][assetInfo.assetId] = {
            ...assets[network][assetInfo.assetId],
            ...this.toAssetDetails(assetInfo),
          };
        });

        this.store.updateState({ assets });
      } catch (error) {
        // Add placeholder data for failed assets to prevent infinite loading
        batchIds.forEach(assetId => {
          if (!assets[network][assetId]) {
            assets[network][assetId] = {
              id: assetId,
              name: `${assetId.slice(0, 8)}...`,
              displayName: `${assetId.slice(0, 8)}...`,
              ticker: assetId.slice(0, 4),
              precision: 8,
              description: 'Failed to load asset details',
              height: 0,
              timestamp: new Date().toJSON(),
              sender: '',
              issuer: '',
              quantity: '0',
              reissuable: false,
              lastUpdated: new Date().getTime(),
              isSuspicious: false,
            };
          }
        });

        this.store.updateState({ assets });
      }
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
    } catch {
      // Price fetch failed
    }
  }

  async updateInfo() {
    const network = this.getNetwork();

    try {
      if (network === NetworkName.Mainnet) {
        const [wavesResp, unit0Resp] = await Promise.all([
          fetch(new URL('/api/v1/assets', DATA_SERVICE_URL)),
          fetch(new URL('/api/v1/unit0/assets', DATA_SERVICE_URL)),
        ]);

        const assets: Array<{
          id: string;
          ticker: string;
          url: string;
        }> = [];

        if (wavesResp.ok) {
          const wavesAssets = (await wavesResp.json()) as Array<{
            id: string;
            ticker: string;
            url: string;
          }>;
          assets.push(...wavesAssets);
        }

        if (unit0Resp.ok) {
          const unit0Assets = (await unit0Resp.json()) as Array<{
            id: string;
            ticker: string;
            url: string;
          }>;
          assets.push(...unit0Assets);
        }

        if (assets.length > 0) {
          const { assetLogos, assetTickers } = this.store.getState();

          const processedAssets = await Promise.all(
            assets.map(async ({ id, ticker, url }) => {
              let dataUrl: string | null = null;

              if (url) {
                dataUrl = await fetchIconAsDataUrl(url);
              }

              return {
                id,
                ticker,
                dataUrl,
              };
            }),
          );

          const updatedAssetLogos: StorageLocalState['assetLogos'] = {
            ...assetLogos,
          };
          const updatedAssetTickers: StorageLocalState['assetTickers'] = {
            ...assetTickers,
          };

          processedAssets.forEach(({ id, ticker, dataUrl }) => {
            if (dataUrl) {
              updatedAssetLogos[id] = dataUrl;
            }

            updatedAssetTickers[id] = ticker;
          });

          this.store.updateState({
            assetLogos: updatedAssetLogos,
            assetTickers: updatedAssetTickers,
          });
        }
      }
    } catch {
      // Ignore backend errors and fall back to static defaults
    }

    this.seedDefaultLogosFromConstants(network);
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
  }
}
