export const WAVESKEEPER_DEBUG = process.env.NODE_ENV !== 'production'

export const CONFIG_URL = 'https://raw.githubusercontent.com/wavesplatform/waves-client-config/master/waves_keeper_blacklist.json';

export const MSG_STATUSES = {
    UNAPPROVED: 'unapproved',
    SIGNED: 'signed',
    PUBLISHED: 'published',
    FAILED: 'failed',
    REJECTED: 'rejected',
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
    NETWORKS: [ 'mainnet', 'testnet' ],
    NETWORK_CONFIG: {
        testnet: {
            code: 'T', server: 'https://pool.testnet.wavesnodes.com/',
            matcher: 'https://matcher.testnet.wavesnodes.com/',
        },
        mainnet: {
            code: 'W', server: 'https://nodes.wavesplatform.com/',
            matcher: 'https://matcher.wavesplatform.com/',
        },
    },
    MESSAGES_CONFIG: {
        message_expiration_ms: 30 * 60 * 1000,
        update_messages_ms: 30 * 1000,
        max_messages: 100,
    },
    PACK_CONFIG: {
        max: 5,
        allow_tx: [3, 4, 5, 6, 7, 10, 11, 12],
    },
};
