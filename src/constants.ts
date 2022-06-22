export const KEEPERWALLET_DEBUG = process.env.NODE_ENV !== 'production';
export const KEEPERWALLET_ENV = process.env.NODE_ENV || 'development';

export const CONFIG_URL =
  'https://raw.githubusercontent.com/wavesplatform/waves-client-config/master/waves_keeper_blacklist.json';

export const allowMatcher = ['dex.tokenomica.com', 'vfa.tokenomica.com'];

export const MSG_STATUSES = {
  UNAPPROVED: 'unapproved',
  SIGNED: 'signed',
  PUBLISHED: 'published',
  FAILED: 'failed',
  REJECTED: 'rejected',
  REJECTED_FOREVER: 'rejected_forever',
  SHOWED_NOTIFICATION: 'showed_notify',
  NEW_NOTIFICATION: 'new_notify',
};

export const STATUS = {
  ERROR: -1,
  OK: 1,
  PENDING: 0,
  UPDATED: 2,
};

export const DEFAULT_CONFIG = {
  CONFIG: {
    update_ms: 30000,
  },
  NETWORKS: ['mainnet', 'testnet', 'stagenet', 'custom'],
  NETWORK_CONFIG: {
    testnet: {
      code: 'T',
      server: 'https://nodes-testnet.wavesnodes.com/',
      matcher: 'https://matcher-testnet.waves.exchange/',
    },
    mainnet: {
      code: 'W',
      server: 'https://nodes-keeper.wavesnodes.com/',
      matcher: 'https://matcher.waves.exchange/',
      swapChannel: 'wss://keeper-swap.wvservices.com/',
    },
    stagenet: {
      code: 'S',
      server: 'https://nodes-stagenet.wavesnodes.com/',
      matcher: 'https://matcher-stagenet.waves.exchange/',
    },
    custom: {
      code: '',
      server: '',
      matcher: '',
    },
  },
  MESSAGES_CONFIG: {
    message_expiration_ms: 30 * 60 * 1000,
    update_messages_ms: 30 * 1000,
    max_messages: 100,
    notification_title_max: 20,
    notification_interval_min: 30 * 1000,
    notification_message_max: 250,
  },
  PACK_CONFIG: {
    max: 7,
    allow_tx: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  },
  IDLE: {
    idle: 0,
    '5m': 5 * 60 * 1000,
    '10m': 10 * 60 * 1000,
    '20m': 20 * 60 * 1000,
    '40m': 40 * 60 * 1000,
    '1h': 60 * 60 * 1000,
  },
};

export const DEFAULT_FEE_CONFIG_URL =
  'https://raw.githubusercontent.com/wavesplatform/waves-client-config/master/fee.json';

export const DEFAULT_FEE_CONFIG = {
  smart_asset_extra_fee: 400000,
  smart_account_extra_fee: 400000,
  calculate_fee_rules: {
    default: {
      add_smart_asset_fee: true,
      add_smart_account_fee: true,
      min_price_step: 100000,
      fee: 100000,
    },
    3: {
      fee: 100000000,
      nftFee: 100000,
    },
    7: {
      add_smart_account_fee: false,
      fee: 300000,
    },
    11: {
      price_per_transfer: 50000,
    },
    12: {
      price_per_kb: 100000,
    },
    13: {
      fee: 1000000,
    },
    15: {
      fee: 100000000,
    },
    16: {
      price_per_kb: 100000,
    },
    17: {
      fee: 100000,
    },
  },
};

export const IGNORE_ERRORS_CONFIG_URL =
  'https://raw.githubusercontent.com/Waves-Keeper/configs/master/keeper-ignore-errors.json';

export const IGNORE_ERRORS_CONFIG_UPDATE_INTERVAL = 1;

export const DEFAULT_IGNORE_ERRORS_CONFIG = {
  ignoreAll: false,
  beforeSend: [
    'An operation that changes interface state is in progress',
    'Failed to fetch',
    'NetworkError when attempting to fetch resource',
    'No device selected',
    'The operation was aborted',
  ],
  beforeSendAccounts: [],
  beforeSendBackground: [],
  beforeSendPopup: [],
  contentScriptApprove: [] as string[],
  popupApprove: [] as string[],
};

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

export const IDENTITY_CONFIG_UPDATE_INTERVAL = 1;
