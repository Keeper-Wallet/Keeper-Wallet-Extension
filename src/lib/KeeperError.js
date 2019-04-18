/**
 * @type {
 * {
 *  "8": {msg: string, name: string},
 *  "9": {msg: string, name: string},
 *  "11": {msg: string, name: string},
 *  "12": {msg: string, name: string},
 *  "13": {msg: string, name: string},
 *  "14": {msg: string, name: string},
 *  "15": {msg: string, name: string},
 *  "16": {msg: string, name: string},
 *  "17": {msg: string, name: string},
 *  "10": {msg: string, name: string}
 *  }}
 */
const ERRORS_DATA = {
    8: { msg: 'Invalid data format', name: 'INVALID_FORMAT' },
    9: { msg: 'Invalid request data', name: 'REQUEST_ERROR' },
    10: { msg: 'User denied message', name: 'USER_DENIED' },
    11: { msg: 'Unknown error', name: 'UNKNOWN' },
    12: { msg: 'Api rejected by user', name: 'API_DENIED' },
    13: { msg: 'Init Waves Keeper and add account', name: 'INIT_KEEPER' },
    14: { msg: 'Add Waves Keeper account', name: 'EMPTY_KEEPER' },
    15: { msg: 'Filed request', name: 'FILED_MSG' },
    16: { msg: 'Unknown transaction data', name: 'UNKNOWN_TX' },
    17: { msg: 'Invalid idle type', name: 'UNKNOWN_IDLE' },
    18: { msg: 'Can\'t sent notification', name: 'NOTIFICATION_ERROR' },
    19: { msg: 'Incorrect notification data', name: 'NOTIFICATION_DATA_ERROR' },
};

const DEF_CODE = 11;
const DEF_ERR = ERRORS_DATA[DEF_CODE].msg;

class KeeperError extends Error {
    constructor(text = DEF_ERR, code = DEF_CODE, data = null) {
        super(text);
        this.data = data;
        this.code = code;
    }
}

/**
 * @type {
 *  {
 *    "INVALID_FORMAT": (function(*=): KeeperError)
 *    "REQUEST_ERROR": (function(*=): KeeperError)
 *    "USER_DENIED": (function(*=): KeeperError)
 *    "UNKNOWN": (function(*=): KeeperError)
 *    "API_DENIED": (function(*=): KeeperError)
 *    "INIT_KEEPER": (function(*=): KeeperError)
 *    "EMPTY_KEEPER": (function(*=): KeeperError)
 *    "UNKNOWN_IDLE": (function(*=): KeeperError)
 *    "FILED_MSG": (function(*=): KeeperError)
 *    "UNKNOWN_TX": (function(*=): KeeperError)
 *    "NOTIFICATION_ERROR": (function(*=): KeeperError)
 *    "NOTIFICATION_DATA_ERROR": (function(*=): KeeperError)
 *  }
 * }
 */
export const ERRORS = Object.entries(ERRORS_DATA).reduce((acc, [code, data]) => {
    const { msg, name } = data;
    acc[name] = (e) => new KeeperError(msg, code, e);
    return acc;
}, Object.create(null));
