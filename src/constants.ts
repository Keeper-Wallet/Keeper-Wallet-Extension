import { NetworkName } from 'networks/types';

export const MAX_TX_HISTORY_ITEMS = 101;
export const MAX_NFT_ITEMS = 1000;

export const STATUS = {
  ERROR: -1,
  OK: 1,
  PENDING: 0,
  UPDATED: 2,
};

export const NETWORK_CONFIG: Record<
  NetworkName,
  {
    matcherBaseUrl: string;
    name: NetworkName;
    networkCode: string;
    nodeBaseUrl: string;
  }
> = {
  [NetworkName.Testnet]: {
    matcherBaseUrl: 'https://matcher-testnet.waves.exchange/',
    name: NetworkName.Testnet,
    networkCode: 'T',
    nodeBaseUrl: 'https://nodes-testnet.wavesnodes.com/',
  },
  [NetworkName.Mainnet]: {
    matcherBaseUrl: 'https://matcher.waves.exchange/',
    name: NetworkName.Mainnet,
    networkCode: 'W',
    nodeBaseUrl: 'https://nodes-keeper.wavesnodes.com/',
  },
  [NetworkName.Stagenet]: {
    matcherBaseUrl: 'https://matcher-stagenet.waves.exchange/',
    name: NetworkName.Stagenet,
    networkCode: 'S',
    nodeBaseUrl: 'https://nodes-stagenet.wavesnodes.com/',
  },
  [NetworkName.Custom]: {
    matcherBaseUrl: '',
    name: NetworkName.Custom,
    networkCode: '',
    nodeBaseUrl: '',
  },
};

export const DEFAULT_MAIN_CONFIG = {
  whitelist: [
    'swop.fi',
    'waves.exchange',
    'testnet.waves.exchange',
    'waves-dapp.com',
    'waves-ide.com',
    'wavesducks.com',
    'vires.finance',
    'v2.vires.finance',
    'web.keeper-wallet.app',
    'swap.keeper-wallet.app',
    'app.power.tech',
  ],
  networks: ['mainnet', 'testnet', 'stagenet', 'custom'],
  messages_config: {
    message_expiration_ms: 30 * 60 * 1000,
    update_messages_ms: 30 * 1000,
    notification_title_max: 20,
    notification_interval_min: 30 * 1000,
    notification_message_max: 250,
  },
  pack_config: {
    max: 7,
    allow_tx: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  },
  idle: {
    idle: 0,
    '5m': 5 * 60 * 1000,
    '10m': 10 * 60 * 1000,
    '20m': 20 * 60 * 1000,
    '40m': 40 * 60 * 1000,
    '1h': 60 * 60 * 1000,
  },
  assets: {
    maxAssetsPerRequest: 100,
  },
  ignoreErrors: {
    ignoreAll: false,
    beforeSend: [
      'An operation that changes interface state is in progress',
      'Failed to fetch',
      'NetworkError when attempting to fetch resource',
      'No device selected',
      'The operation was aborted',
    ],
    beforeSendAccounts: [] as string[],
    beforeSendBackground: [] as string[],
    beforeSendPopup: [] as string[],
    contentScriptApprove: [] as string[],
    popupApprove: [] as string[],
  },
  nfts: {
    signArtImgUrl: 'https://signart.infura-ipfs.io/ipfs/{domain}/{filename}',
  },
};

export type MainConfig = typeof DEFAULT_MAIN_CONFIG;
export type AssetsConfig = MainConfig['assets'];
export type IgnoreErrorsConfig = MainConfig['ignoreErrors'];
export type NftConfig = MainConfig['nfts'];

export type IgnoreErrorsContext = {
  [K in keyof IgnoreErrorsConfig]: IgnoreErrorsConfig[K] extends string[]
    ? K
    : never;
}[keyof IgnoreErrorsConfig];

export const DEFAULT_IDENTITY_CONFIG = {
  testnet: {
    apiUrl: 'https://id-testnet.waves.exchange/api',
    cognito: {
      userPoolId: 'eu-central-1_6Bo3FEwt5',
      clientId: '7l8bv0kmvrb4s4n1topofh9d80',
      endpoint: 'https://testnet.waves.exchange/cognito',
    },
  },
  mainnet: {
    apiUrl: 'https://id.waves.exchange/api',
    cognito: {
      userPoolId: 'eu-central-1_AXIpDLJQx',
      clientId: 'k63vrrmuav01s6p2d344ppnf4',
      endpoint: 'https://waves.exchange/cognito',
    },
  },
};
