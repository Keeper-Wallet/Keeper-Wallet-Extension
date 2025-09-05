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

const UNIT0: AssetDetail = {
  quantity: '10000000000000000',
  ticker: 'UNIT0',
  id: 'unit0',
  name: 'Unit0',
  precision: 18,
  description: 'Unit0 native token',
  height: 0,
  issuer: '',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'UNIT0',
};

// Unit0 tokens with their contract addresses and asset objects
const UNIT0_WETH: AssetDetail = {
  quantity: '33935200000000000000000',
  ticker: 'WETH',
  id: '0x1B100DE3F13E3f8Bb2f66FE58c1949c32E7124B',
  name: 'Wrapped Ethereum on Unit0',
  precision: 18,
  description: 'Wrapped Ethereum on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'WETH',
};

const UNIT0_DAI: AssetDetail = {
  quantity: '1118000000000000000000000',
  ticker: 'DAI',
  id: '0xfA88d31044197fa9fAC50b8b7f6F4b54CC68d80e',
  name: 'DAI Stablecoin on Unit0',
  precision: 18,
  description: 'DAI Stablecoin on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'DAI',
};

const UNIT0_AAVE: AssetDetail = {
  quantity: '15000000000000000000000',
  ticker: 'AAVE',
  id: '0xbF66EaedC8A3a3B16d2A11F269f3FEC755fca4E5',
  name: 'AAVE Token on Unit0',
  precision: 18,
  description: 'AAVE Token on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'AAVE',
};

const UNIT0_WUNIT0: AssetDetail = {
  quantity: '8142890803253827481',
  ticker: 'WUNIT0',
  id: '0x5E73CEc92450a4eAE6B7A3Ea99459B0D069eFef5',
  name: 'Wrapped Unit0 Token',
  precision: 18,
  description: 'Wrapped Unit0 Token',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'WUNIT0',
};

const UNIT0_USDC: AssetDetail = {
  quantity: '1000000002476110000000',
  ticker: 'USDC',
  id: '0xD48A37F4F6B9f5a5d1be16e87459Bc1AcA201026',
  name: 'USD Coin on Unit0',
  precision: 6,
  description: 'USD Coin on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'USDC',
};

const UNIT0_WBTC: AssetDetail = {
  quantity: '3800000000000',
  ticker: 'WBTC',
  id: '0x1876c32a0CF3eeB7d1eFf2F3C29AdFCF5B956270',
  name: 'Wrapped Bitcoin on Unit0',
  precision: 8,
  description: 'Wrapped Bitcoin on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'WBTC',
};

const UNIT0_USDT: AssetDetail = {
  quantity: '50000000002581102000000',
  ticker: 'USDT',
  id: '0x333fE97265D2C95bC1CF06d8ac1f410fCf97A737',
  name: 'Tether USD on Unit0',
  precision: 6,
  description: 'Tether USD on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'USDT',
};

const UNIT0_UNI_V3_POS_NEW: AssetDetail = {
  quantity: '1',
  ticker: 'UNI-V3-POS',
  id: '0x4B72F0F2c222C6323589E46c0119154b74839d0f',
  name: 'Uniswap V3 Positions NFT on Unit0',
  precision: 0,
  description: 'Uniswap V3 Positions NFT on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'UNI-V3-POS',
};

const UNIT0_MEMMA: AssetDetail = {
  quantity: '1000000000000000000000000000',
  ticker: 'Memma',
  id: '0xF252401108d869656Fa682e67B04AC9e9F4a388e',
  name: 'Memma',
  precision: 18,
  description: 'Memma token on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'Memma',
};

const UNIT0_SANCHO: AssetDetail = {
  quantity: '1000000000000000000000000000',
  ticker: 'Sancho',
  id: '0x7900c01eED60868beEA1DE79730CA5633A4b6a45',
  name: 'Sancho',
  precision: 18,
  description: 'Sancho token on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'Sancho',
};

const UNIT0_UWUNIT0: AssetDetail = {
  quantity: '756568624198905160675594',
  ticker: 'uWUNIT0',
  id: '0x94b514606C161677d1B243d4c4b069B3f2Fb8682',
  name: 'Unilend Interest Bearing WUNIT0',
  precision: 18,
  description: 'Unilend Interest Bearing WUNIT0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'uWUNIT0',
};

const UNIT0_VARIABLE_DEBT_WUNIT0: AssetDetail = {
  quantity: '75121296297620043212772',
  ticker: 'variableDebtWUNIT0',
  id: '0xC447FCdFab3b8D70EEc7d4F85dE486b4E5ea74Ac',
  name: 'Unilend Variable Debt WUNIT0',
  precision: 18,
  description: 'Unilend Variable Debt WUNIT0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'variableDebtWUNIT0',
};

const UNIT0_VARIABLE_DEBT_USDT: AssetDetail = {
  quantity: '216491492118',
  ticker: 'variableDebtUSDT',
  id: '0xeEdF214BB01499364e4e44e4325e5bFFd0ae2719',
  name: 'Unilend Variable Debt USDT',
  precision: 6,
  description: 'Unilend Variable Debt USDT',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'variableDebtUSDT',
};

const UNIT0_USDT_NEW: AssetDetail = {
  quantity: '477991904097',
  ticker: 'USDT',
  id: '0xb303d80db8415FD1d3C9FED68A52EEAc9a052671',
  name: 'USDT',
  precision: 6,
  description: 'USDT on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'USDT',
};

const UNIT0_USDC_NEW: AssetDetail = {
  quantity: '94359012595',
  ticker: 'USDC',
  id: '0xEb19000D90f17FFbd3AD9CDB8915D928F4980fD1',
  name: 'USDC',
  precision: 6,
  description: 'USDC on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'USDC',
};

const UNIT0_DOGE: AssetDetail = {
  quantity: '1000000000000000000000000000',
  ticker: 'DOGE',
  id: '0x6D118c61A03d63CE6b4387EfdE9E3bA3323833b9',
  name: 'DOGE on Unit0',
  precision: 18,
  description: 'DOGE Token on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'DOGE',
};

const UNIT0_MCSASHA: AssetDetail = {
  quantity: '1000000000000000000000000000',
  ticker: 'MCSASHA',
  id: '0x6DFE63380149E04f4DD9BD7E8d892eEc28878556',
  name: 'McSasha on Unit0',
  precision: 18,
  description: 'McSasha Token on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'McSasha',
};

const UNIT0_ZNS_CONNECT: AssetDetail = {
  quantity: '1',
  ticker: '.unit',
  id: '0xFb2Cd41a8aeC89EFBb19575C6c48d872cE97A0A5',
  name: 'ZNS Connect NFT',
  precision: 0,
  description: 'ZNS Connect Domain NFT on Unit0',
  height: 0,
  issuer: '',
  timestamp: '2024-01-01T00:00:00.000Z' as any,
  sender: '',
  reissuable: false,
  displayName: 'ZNS Connect',
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
          unit0: UNIT0,
          weth: UNIT0_WETH,
          dai: UNIT0_DAI,
          aave: UNIT0_AAVE,
          wunit0: UNIT0_WUNIT0,
          usdc: UNIT0_USDC,
          wbtc: UNIT0_WBTC,
          usdt: UNIT0_USDT,
          'uni-v3-pos': UNIT0_UNI_V3_POS_NEW,
          memma: UNIT0_MEMMA,
          sancho: UNIT0_SANCHO,
          uWUNIT0: UNIT0_UWUNIT0,
          variableDebtWUNIT0: UNIT0_VARIABLE_DEBT_WUNIT0,
          variableDebtUSDT: UNIT0_VARIABLE_DEBT_USDT,
          USDT_NEW: UNIT0_USDT_NEW,
          USDC_NEW: UNIT0_USDC_NEW,
          doge: UNIT0_DOGE,
          mcsasha: UNIT0_MCSASHA,
          'zns-connect': UNIT0_ZNS_CONNECT,
        },
        [NetworkName.Stagenet]: {
          WAVES,
        },
        [NetworkName.Testnet]: {
          WAVES,
          unit0: UNIT0,
          weth: UNIT0_WETH,
          dai: UNIT0_DAI,
          aave: UNIT0_AAVE,
          wunit0: UNIT0_WUNIT0,
          usdc: UNIT0_USDC,
          wbtc: UNIT0_WBTC,
          usdt: UNIT0_USDT,
          'uni-v3-pos': UNIT0_UNI_V3_POS_NEW,
          memma: UNIT0_MEMMA,
          sancho: UNIT0_SANCHO,
          uWUNIT0: UNIT0_UWUNIT0,
          variableDebtWUNIT0: UNIT0_VARIABLE_DEBT_WUNIT0,
          variableDebtUSDT: UNIT0_VARIABLE_DEBT_USDT,
          USDT_NEW: UNIT0_USDT_NEW,
          USDC_NEW: UNIT0_USDC_NEW,
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

    // Unit0 tokens with their contract addresses and asset objects
    const unit0TokensMap = {
      '0x1B100DE3F13E3f8Bb2f66FE58c1949c32E7124B': UNIT0_WETH,
      '0xfA88d31044197fa9fAC50b8b7f6F4b54CC68d80e': UNIT0_DAI,
      '0xbF66EaedC8A3a3B16d2A11F269f3FEC755fca4E5': UNIT0_AAVE,
      '0x5E73CEc92450a4eAE6B7A3Ea99459B0D069eFef5': UNIT0_WUNIT0,
      '0xD48A37F4F6B9f5a5d1be16e87459Bc1AcA201026': UNIT0_USDC,
      '0x1876c32a0CF3eeB7d1eFf2F3C29AdFCF5B956270': UNIT0_WBTC,
      '0x333fE97265D2C95bC1CF06d8ac1f410fCf97A737': UNIT0_USDT,
      '0x4B72F0F2c222C6323589E46c0119154b74839d0f': UNIT0_UNI_V3_POS_NEW,
      '0xF252401108d869656Fa682e67B04AC9e9F4a388e': UNIT0_MEMMA,
      '0x7900c01eED60868beEA1DE79730CA5633A4b6a45': UNIT0_SANCHO,
      '0x94b514606C161677d1B243d4c4b069B3f2Fb8682': UNIT0_UWUNIT0,
      '0xC447FCdFab3b8D70EEc7d4F85dE486b4E5ea74Ac': UNIT0_VARIABLE_DEBT_WUNIT0,
      '0xeEdF214BB01499364e4e44e4325e5bFFd0ae2719': UNIT0_VARIABLE_DEBT_USDT,
      '0xb303d80db8415FD1d3C9FED68A52EEAc9a052671': UNIT0_USDT_NEW,
      '0xEb19000D90f17FFbd3AD9CDB8915D928F4980fD1': UNIT0_USDC_NEW,
      '0x6D118c61A03d63CE6b4387EfdE9E3bA3323833b9': UNIT0_DOGE,
      '0x6DFE63380149E04f4DD9BD7E8d892eEc28878556': UNIT0_MCSASHA,
      '0xFb2Cd41a8aeC89EFBb19575C6c48d872cE97A0A5': UNIT0_ZNS_CONNECT,
    };

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

    // Check if Unit0 ERC-20/ERC-721 tokens exist in mainnet
    Object.entries(unit0TokensMap).forEach(([contractAddress, assetDetail]) => {
      if (!assets[NetworkName.Mainnet][contractAddress]) {
        assets[NetworkName.Mainnet][contractAddress] = assetDetail;
        needsUpdate = true;
      }
    });

    // Check if Unit0 ERC-20/ERC-721 tokens exist in testnet
    Object.entries(unit0TokensMap).forEach(([contractAddress, assetDetail]) => {
      if (!assets[NetworkName.Testnet][contractAddress]) {
        assets[NetworkName.Testnet][contractAddress] = assetDetail;
        needsUpdate = true;
      }
    });

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

  addTickersForExistingUnit0Assets() {
    const { assets } = this.store.getState();

    const unit0AssetTickers: Record<string, string> = {
      '0x1B100DE3F13E3f8Bb2f66FE58c1949c32E7124B': 'WETH',
      '0xfA88d31044197fa9fAC50b8b7f6F4b54CC68d80e': 'DAI',
      '0xbF66EaedC8A3a3B16d2A11F269f3FEC755fca4E5': 'AAVE',
      '0x5E73CEc92450a4eAE6B7A3Ea99459B0D069eFef5': 'WUNIT0',
      '0xD48A37F4F6B9f5a5d1be16e87459Bc1AcA201026': 'USDC',
      '0x1876c32a0CF3eeB7d1eFf2F3C29AdFCF5B956270': 'WBTC',
      '0x333fE97265D2C95bC1CF06d8ac1f410fCf97A737': 'USDT',
      '0x4B72F0F2c222C6323589E46c0119154b74839d0f': 'UNI-V3-POS',
      '0xF252401108d869656Fa682e67B04AC9e9F4a388e': 'Memma',
      '0x7900c01eED60868beEA1DE79730CA5633A4b6a45': 'Sancho',
      '0x94b514606C161677d1B243d4c4b069B3f2Fb8682': 'uWUNIT0',
      '0xC447FCdFab3b8D70EEc7d4F85dE486b4E5ea74Ac': 'variableDebtWUNIT0',
      '0xeEdF214BB01499364e4e44e4325e5bFFd0ae2719': 'variableDebtUSDT',
      '0xb303d80db8415FD1d3C9FED68A52EEAc9a052671': 'USDT',
      '0xEb19000D90f17FFbd3AD9CDB8915D928F4980fD1': 'USDC',
      '0x6D118c61A03d63CE6b4387EfdE9E3bA3323833b9': 'DOGE',
      '0x6DFE63380149E04f4DD9BD7E8d892eEc28878556': 'MCSASHA',
      '0xFb2Cd41a8aeC89EFBb19575C6c48d872cE97A0A5': 'ZNS Connect',
    };

    const assetIdsToUpdate = Object.keys(unit0AssetTickers).filter(assetId => {
      const asset = assets.mainnet[assetId];
      const ticker = unit0AssetTickers[assetId];

      return asset && (asset.displayName !== ticker || asset.ticker !== ticker);
    });

    if (assetIdsToUpdate.length !== 0) {
      assetIdsToUpdate.forEach(assetId => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const asset = assets.mainnet[assetId]!;
        const ticker = unit0AssetTickers[assetId];

        asset.displayName = asset.ticker = ticker;
      });

      this.store.updateState({ assets });
    }
  }

  getWavesAsset() {
    return WAVES;
  }

  getUnit0Asset() {
    return UNIT0;
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
