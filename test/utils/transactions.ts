import { TRANSACTION_TYPE } from '@waves/ts-types';

export const ISSUE = {
  type: TRANSACTION_TYPE.ISSUE,
  data: {
    name: 'ShortToken',
    description: 'Full description of ShortToken',
    quantity: '9223372036854775807',
    precision: 8 as const,
    reissuable: true,
    script: 'base64:BQbtKNoM',
  },
};

export const ISSUE_WITHOUT_SCRIPT = {
  type: TRANSACTION_TYPE.ISSUE,
  data: {
    name: 'ShortToken',
    description: 'Full description of ShortToken',
    quantity: '9223372036854775807',
    precision: 8 as const,
    reissuable: true,
    script: '',
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

export const TRANSFER_WITHOUT_ATTACHMENT = {
  type: TRANSACTION_TYPE.TRANSFER,
  data: {
    amount: {
      amount: 123456790,
      assetId: 'WAVES',
    },
    recipient: 'alice',
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

export const REISSUE_WITH_MONEY_LIKE = {
  type: TRANSACTION_TYPE.REISSUE,
  data: {
    amount: {
      amount: 123456790,
      assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    },
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

export const BURN_WITH_QUANTITY = {
  type: TRANSACTION_TYPE.BURN,
  data: {
    assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    quantity: 123456790,
  },
};

export const LEASE = {
  type: TRANSACTION_TYPE.LEASE,
  data: { recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD', amount: 123456790 },
};

export const LEASE_WITH_ALIAS = {
  type: TRANSACTION_TYPE.LEASE,
  data: { recipient: 'bobby', amount: 123456790 },
};

export const LEASE_WITH_MONEY_LIKE = {
  type: TRANSACTION_TYPE.LEASE,
  data: {
    recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD',
    amount: { assetId: 'WAVES', amount: 123456790 },
  },
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
      { amount: 1, recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD' },
      {
        amount: { assetId: 'WAVES', tokens: '0.00000001' },
        recipient: 'merry',
      },
    ],
    attachment: 'base64:BQbtKNoM',
  },
};

export const MASS_TRANSFER_WITHOUT_ATTACHMENT = {
  type: TRANSACTION_TYPE.MASS_TRANSFER,
  data: {
    totalAmount: {
      amount: 0,
      assetId: 'WAVES',
    },
    transfers: [
      { amount: 120, recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD' },
      { amount: 3, recipient: 'merry' },
    ],
  },
};

export const DATA = {
  type: TRANSACTION_TYPE.DATA,
  data: {
    data: [
      {
        key: 'stringValue',
        type: 'string' as const,
        value: 'Lorem ipsum dolor sit amet',
      },
      {
        key: 'longMaxValue',
        type: 'integer' as const,
        value: '9223372036854775807',
      },
      { key: 'flagValue', type: 'boolean' as const, value: true },
      { key: 'base64', type: 'binary' as const, value: 'base64:BQbtKNoM' },
    ],
  },
};

export const SET_SCRIPT = {
  type: TRANSACTION_TYPE.SET_SCRIPT,
  data: { script: 'base64:BQbtKNoM' },
};

export const SET_SCRIPT_WITHOUT_SCRIPT = {
  type: TRANSACTION_TYPE.SET_SCRIPT,
  data: { script: '' },
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

export const SPONSORSHIP_REMOVAL = {
  type: TRANSACTION_TYPE.SPONSORSHIP,
  data: {
    minSponsoredAssetFee: {
      assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
      amount: 0,
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
      args: [
        {
          type: 'integer' as const,
          value: 42,
        },
        {
          type: 'boolean' as const,
          value: false,
        },
        {
          type: 'string' as const,
          value: 'hello',
        },
      ],
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

export const INVOKE_SCRIPT_WITHOUT_CALL = {
  type: TRANSACTION_TYPE.INVOKE_SCRIPT,
  data: {
    fee: {
      amount: 500000,
      assetId: null,
    },
    dApp: 'chris',
    payment: [],
  },
};

export const UPDATE_ASSET_INFO = {
  type: TRANSACTION_TYPE.UPDATE_ASSET_INFO,
  data: {
    fee: {
      amount: 100000,
      assetId: null,
    },
    assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
    name: 'New Name',
    description: 'New Description',
  },
};

export const SET_SCRIPT_COMPILED = {
  type: TRANSACTION_TYPE.SET_SCRIPT,
  data: {
    script:
      'base64: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',
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
