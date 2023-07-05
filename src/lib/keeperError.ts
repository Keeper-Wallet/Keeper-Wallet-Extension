const ERRORS_DATA = {
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
} as const;

type ErrorName = (typeof ERRORS_DATA)[keyof typeof ERRORS_DATA]['name'];

export class KeeperError {
  code;
  data;
  message;

  constructor(message = 'Unknown error', code = '11', data: unknown = null) {
    this.code = code;
    this.data = data;
    this.message = message;
  }
}

export const ERRORS = Object.entries(ERRORS_DATA).reduce(
  (acc, [code, { msg, name }]) => {
    acc[name] = (message, data) => {
      return new KeeperError(message ? `${msg}: ${message}` : msg, code, data);
    };

    return acc;
  },
  {} as Record<ErrorName, (message?: string, data?: unknown) => KeeperError>,
);
