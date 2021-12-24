export const WAVESKEEPER_DEBUG = process.env.NODE_ENV !== 'production';
export const WAVESKEEPER_ENV = process.env.NODE_ENV || 'development';

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
      server: 'https://nodes.wavesnodes.com/',
      matcher: 'https://matcher.waves.exchange/',
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
      fee: 500000,
    },
    17: {
      fee: 100000,
    },
  },
};

export const SWAP_DAPPS = {
  mainnet: '3P8eoZF8RTpcrVXwYcDaNs7WBGMbrBR8d3u',
  testnet: '3MvdzbvEZLHEE3EXHXxaRQjgpNqq28733ao',
};
