export const NETWORK_CONFIG = {
    testnet: {code: 'T', server: 'https://pool.testnet.wavesnodes.com/', matcher: 'https://matcher.testnet.wavesnodes.com/'},
    mainnet: {code: 'W', server: 'https://nodes.wavesplatform.com/', matcher: 'https://matcher.wavesplatform.com/'}
};

export const NETWORKS = [ 'mainnet', 'testnet' ];

export const BLACK_LIST_CONFIG = 'https://raw.githubusercontent.com/wavesplatform/waves-client-config/master/waves_keeper_blacklist.json';

export const MSG_STATUSES = {
    UNAPPROVED: 'unapproved',
    SIGNED: 'signed',
    PUBLISHED: 'published',
    FAILED: 'failed',
    REJECTED: 'rejected',
};


export const MAX_PACK_TXS = 8;
export const DELETE_MSG_TIME = 30 * 60 * 1000;
export const UPDATE_MSG_STATE_TIME = 30 * 1000;
