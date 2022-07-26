export const ERRORS_DATA = {
  8: { msg: 'Invalid data format', name: 'INVALID_FORMAT' },
  9: { msg: 'Invalid request data', name: 'REQUEST_ERROR' },
  10: { msg: 'User denied message', name: 'USER_DENIED' },
  11: { msg: 'Unknown error', name: 'UNKNOWN' },
  12: { msg: 'Api rejected by user', name: 'API_DENIED' },
  13: { msg: 'Init Keeper Wallet and add account', name: 'INIT_KEEPER' },
  14: { msg: 'Add Keeper Wallet account', name: 'EMPTY_KEEPER' },
  15: { msg: 'Failed request', name: 'FAILED_MSG' },
  16: { msg: 'Unknown transaction data', name: 'UNKNOWN_TX' },
  17: { msg: 'Invalid idle type', name: 'UNKNOWN_IDLE' },
  18: { msg: "Can't sent notification", name: 'NOTIFICATION_ERROR' },
  19: { msg: 'Incorrect notification data', name: 'NOTIFICATION_DATA_ERROR' },
};

const DEF_CODE = 11;
const DEF_ERR = ERRORS_DATA[DEF_CODE].msg;

class KeeperError extends Error {
  code: number | string;
  data: unknown;

  constructor(
    text: string = DEF_ERR,
    code: number | string = DEF_CODE,
    data: unknown = null
  ) {
    super(text);
    this.data = data;
    this.code = code;
  }
}

export const ERRORS = Object.entries(ERRORS_DATA).reduce(
  (acc, [code, data]) => {
    const { msg, name } = data;
    acc[name] = (message: unknown, data: unknown) =>
      new KeeperError(message ? `${msg}: ${message}` : msg, code, data);
    return acc;
  },
  Object.create(null)
);
