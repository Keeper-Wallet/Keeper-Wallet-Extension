import { ERRORS } from '../lib/KeeperError';

const emptyTxConverter = tx => {
  return { ...tx };
};

const WKTConverterV1 = {
  TX_BY_TYPE: {
    3: {
      1: emptyTxConverter,
    },
    4: {
      1: emptyTxConverter,
    },
    5: {
      1: emptyTxConverter,
    },
    6: {
      1: emptyTxConverter,
    },
    8: {
      1: emptyTxConverter,
    },
    9: {
      1: emptyTxConverter,
    },
    10: {
      1: emptyTxConverter,
    },
    11: {
      1: emptyTxConverter,
    },
    12: {
      1: emptyTxConverter,
    },
    13: {
      1: emptyTxConverter,
    },
    14: {
      1: emptyTxConverter,
    },
    15: {
      1: emptyTxConverter,
    },
    17: {
      1: emptyTxConverter,
    },
  },
};

export const isKeeperTransactionData = (version, tx) => {
  const v1 = 1;

  if (!tx || !tx.type || !tx.data) {
    throw ERRORS.INVALID_FORMAT();
  }

  const converter = WKTConverterV1[tx.type];

  if (!converter || converter[version]) {
    throw ERRORS.UNKNOWN_TX();
  }

  return converter[version](tx);
};
