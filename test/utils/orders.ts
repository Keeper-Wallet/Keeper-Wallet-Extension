export const CREATE_ORDER = {
  type: 1002,
  data: {
    matcherPublicKey: '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy',
    orderType: 'sell',
    expiration: Date.now() + 100000,
    amount: {
      tokens: '100',
      assetId: 'WAVES',
    },
    price: {
      tokens: '0.01',
      assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    },
    matcherFee: {
      tokens: '0.03',
      assetId: 'WAVES',
    },
  },
};

export const CREATE_ORDER_WITH_PRICE_PRECISION_CONVERSION = {
  type: 1002,
  data: {
    matcherPublicKey: '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy',
    orderType: 'buy',
    expiration: Date.now() + 100000,
    amount: {
      tokens: '1.000000',
      assetId: '5Sh9KghfkZyhjwuodovDhB6PghDUGBHiAPZ4MkrPgKtX',
    },
    price: {
      tokens: '1.014002',
      assetId: '25FEqEjRkqK6yCkiT7Lz6SAYz7gUFCtxfCChnrVFD5AT',
    },
    matcherFee: {
      tokens: '0.04077612',
      assetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
    },
  },
};

export const CANCEL_ORDER = {
  type: 1003,
  data: {
    id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap',
  },
};
