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

export const CANCEL_ORDER = {
  type: 1003,
  data: {
    id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap',
  },
};
