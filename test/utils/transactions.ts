import { TRANSACTION_TYPE } from '@waves/ts-types';

export const ISSUE = {
  type: TRANSACTION_TYPE.ISSUE,
  data: {
    name: 'ShortToken',
    description: 'Full description of ShortToken',
    quantity: '9223372036854775807',
    precision: 8,
    reissuable: true,
    script: 'base64:BQbtKNoM',
  },
};

export const TRANSFER = {
  type: TRANSACTION_TYPE.TRANSFER,
  data: {
    amount: {
      amount: 123456790,
      assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    },
    recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD',
    attachment: 'base64:BQbtKNoM',
  },
};

export const REISSUE = {
  type: TRANSACTION_TYPE.REISSUE,
  data: {
    assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    quantity: 123456790,
    reissuable: true,
  },
};

export const BURN = {
  type: TRANSACTION_TYPE.BURN,
  data: {
    assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    amount: 123456790,
  },
};

export const LEASE = {
  type: TRANSACTION_TYPE.LEASE,
  data: { recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD', amount: 123456790 },
};

export const CANCEL_LEASE = {
  type: TRANSACTION_TYPE.CANCEL_LEASE,
  data: { leaseId: '6r2u8Bf3WTqJw4HQvPTsWs8Zak5PLwjzjjGU76nXph1u' },
};

export const ALIAS = {
  type: TRANSACTION_TYPE.ALIAS,
  data: { alias: 'test_alias' },
};

export const MASS_TRANSFER = {
  type: TRANSACTION_TYPE.MASS_TRANSFER,
  data: {
    totalAmount: {
      amount: 0,
      assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    },
    transfers: [
      { amount: 1, recipient: 'testy' },
      { amount: 1, recipient: 'merry' },
    ],
    attachment: 'base64:BQbtKNoM',
  },
};

export const DATA = {
  type: TRANSACTION_TYPE.DATA,
  data: {
    data: [
      {
        key: 'stringValue',
        type: 'string',
        value: 'Lorem ipsum dolor sit amet',
      },
      {
        key: 'longMaxValue',
        type: 'integer',
        value: '9223372036854775807',
      },
      { key: 'flagValue', type: 'boolean', value: true },
      { key: 'base64', type: 'binary', value: 'base64:BQbtKNoM' },
    ],
  },
};

export const SET_SCRIPT = {
  type: TRANSACTION_TYPE.SET_SCRIPT,
  data: { script: 'base64:BQbtKNoM' },
};

export const SPONSORSHIP = {
  type: TRANSACTION_TYPE.SPONSORSHIP,
  data: {
    minSponsoredAssetFee: {
      amount: 123456790,
      assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    },
  },
};

export const SET_ASSET_SCRIPT = {
  type: TRANSACTION_TYPE.SET_ASSET_SCRIPT,
  data: {
    assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    script: 'base64:BQbtKNoM',
  },
};

export const INVOKE_SCRIPT = {
  type: TRANSACTION_TYPE.INVOKE_SCRIPT,
  data: {
    fee: {
      amount: 500000,
      assetId: null,
    },
    dApp: '3My2kBJaGfeM2koiZroaYdd3y8rAgfV2EAx',
    call: {
      function: 'someFunctionToCall',
      args: [],
    },
    payment: [
      { assetId: null, amount: 1 },
      {
        assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
        amount: 1,
      },
    ],
  },
};

export const PACKAGE = [
  ISSUE,
  TRANSFER,
  REISSUE,
  BURN,
  LEASE,
  CANCEL_LEASE,
  INVOKE_SCRIPT,
];
