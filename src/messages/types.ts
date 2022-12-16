import { TRANSACTION_TYPE, TransactionFromNode } from '@waves/ts-types';
import {
  TCustomData,
  TSignedData,
} from '@waves/waves-transactions/dist/requests/custom-data';
import {
  IWavesAuth,
  IWavesAuthParams,
} from '@waves/waves-transactions/dist/transactions';
import { PreferencesAccount } from 'preferences/types';
import { IMoneyLike } from 'ui/utils/converters';

import { MsgStatus } from '../constants';

interface MessageInputTxIssue {
  type: (typeof TRANSACTION_TYPE)['ISSUE'];
  data: {
    description: string;
    fee?: IMoneyLike;
    name: string;
    quantity: string | number;
    precision: number;
    reissuable: boolean;
    senderPublicKey?: string;
    script?: string;
    timestamp?: number;
  };
}

export interface MessageInputTxTransfer {
  type: (typeof TRANSACTION_TYPE)['TRANSFER'];
  data: {
    amount: IMoneyLike;
    attachment?: string;
    fee?: IMoneyLike;
    recipient: string;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

interface MessageInputTxReissue {
  type: (typeof TRANSACTION_TYPE)['REISSUE'];
  data: {
    assetId: string | null;
    fee?: IMoneyLike;
    quantity: string | number;
    reissuable: boolean;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

interface MessageInputTxBurn {
  type: (typeof TRANSACTION_TYPE)['BURN'];
  data: {
    amount: IMoneyLike | string | number;
    assetId: string | null;
    fee?: IMoneyLike;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

interface MessageInputTxLease {
  type: (typeof TRANSACTION_TYPE)['LEASE'];
  data: {
    amount: IMoneyLike | string | number;
    fee?: IMoneyLike;
    recipient: string;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

interface MessageInputTxCancelLease {
  type: (typeof TRANSACTION_TYPE)['CANCEL_LEASE'];
  data: {
    fee?: IMoneyLike;
    leaseId: string;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

interface MessageInputTxAlias {
  type: (typeof TRANSACTION_TYPE)['ALIAS'];
  data: {
    alias: string;
    fee?: IMoneyLike;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

export interface MessageInputTxMassTransfer {
  type: (typeof TRANSACTION_TYPE)['MASS_TRANSFER'];
  data: {
    attachment?: string;
    fee?: IMoneyLike;
    senderPublicKey?: string;
    timestamp?: number;
    totalAmount: { assetId: string | null };
    transfers: Array<{
      amount: IMoneyLike | string | number;
      recipient: string;
    }>;
  };
}

export interface MessageInputTxData {
  type: (typeof TRANSACTION_TYPE)['DATA'];
  data: {
    data: Array<
      { key: string } & (
        | { type: 'binary'; value: string }
        | { type: 'boolean'; value: boolean }
        | { type: 'integer'; value: string | number }
        | { type: 'string'; value: string }
        | { type?: null; value?: null }
      )
    >;
    fee?: IMoneyLike;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

interface MessageInputTxSetScript {
  type: (typeof TRANSACTION_TYPE)['SET_SCRIPT'];
  data: {
    fee?: IMoneyLike;
    script: string | null;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

interface MessageInputTxSponsorship {
  type: (typeof TRANSACTION_TYPE)['SPONSORSHIP'];
  data: {
    fee?: IMoneyLike;
    minSponsoredAssetFee: IMoneyLike;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

interface MessageInputTxSetAssetScript {
  type: (typeof TRANSACTION_TYPE)['SET_ASSET_SCRIPT'];
  data: {
    assetId: string | null;
    fee?: IMoneyLike;
    script: string;
    senderPublicKey?: string;
    timestamp?: number;
  };
}

type InvokeScriptCallArgPrimitive =
  | { type: 'binary'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'integer'; value: string | number }
  | { type: 'string'; value: string };

type InvokeScriptCallArg =
  | InvokeScriptCallArgPrimitive
  | {
      type: 'list';
      value: InvokeScriptCallArgPrimitive[];
    };

interface MessageInputTxInvokeScript {
  type: (typeof TRANSACTION_TYPE)['INVOKE_SCRIPT'];
  data: {
    call?: {
      function: string;
      args: InvokeScriptCallArg[];
    };
    dApp: string;
    fee?: IMoneyLike;
  };
}

interface MessageInputTxUpdateAssetInfo {
  type: (typeof TRANSACTION_TYPE)['UPDATE_ASSET_INFO'];
  data: {
    fee?: IMoneyLike;
    name?: string;
  };
}

interface MessageInputTxEthereum {
  type: (typeof TRANSACTION_TYPE)['ETHEREUM'];
  data: {
    fee?: IMoneyLike;
  };
}

export type MessageInputTx =
  | MessageInputTxIssue
  | MessageInputTxTransfer
  | MessageInputTxReissue
  | MessageInputTxBurn
  | MessageInputTxLease
  | MessageInputTxCancelLease
  | MessageInputTxAlias
  | MessageInputTxMassTransfer
  | MessageInputTxData
  | MessageInputTxSetScript
  | MessageInputTxSponsorship
  | MessageInputTxSetAssetScript
  | MessageInputTxInvokeScript
  | MessageInputTxUpdateAssetInfo
  | MessageInputTxEthereum;

export type MessageInputTxPackage = MessageInputTx[] & {
  data?: never;
  origin?: never;
  successPath?: never;
  type?: never;
};

export type MessageInput = {
  connectionId?: string;
  account: PreferencesAccount;
  broadcast?: boolean;
  options?: {
    uid?: unknown;
  };
  successPath?: string | null;
  title?: string | null;
} & (
  | {
      type: 'auth';
      origin?: string;
      data: {
        data: string;
        host?: string;
        icon?: string;
        name?: string;
        origin?: string;
        referrer?: string;
        successPath?: string;
        type?: number;
      };
    }
  | {
      type: 'authOrigin';
      origin: string;
      data: {
        data?: unknown;
        origin: string;
        successPath?: string;
        type?: never;
      };
    }
  | {
      type: 'cancelOrder';
      origin?: string;
      data: {
        amountAsset?: string;
        data: {
          id: string;
          senderPublicKey?: string;
          timestamp?: number;
        };
        origin?: string;
        priceAsset?: string;
        successPath?: string;
        type: 1003;
      };
    }
  | {
      type: 'customData';
      origin?: string;
      data: TCustomData & {
        origin?: string;
        successPath?: string;
        type?: never;
      };
    }
  | {
      type: 'order';
      origin?: string;
      data: {
        successPath?: string;
        type: 1002;
        data: {
          amount: IMoneyLike;
          expiration: number;
          matcherFee: IMoneyLike;
          price: IMoneyLike;
        };
      };
    }
  | {
      type: 'request';
      origin?: string;
      data: {
        data?: {
          senderPublicKey?: string;
          timestamp?: number;
        };
        origin?: string;
        successPath?: string;
        type?: never;
      };
    }
  | {
      type: 'transaction';
      origin?: string;
      data: MessageInputTx & {
        origin?: string;
        successPath?: string;
      };
    }
  | {
      type: 'transactionPackage';
      origin?: string;
      data: MessageInputTxPackage;
    }
  | {
      type: 'wavesAuth';
      origin?: string;
      data: IWavesAuthParams & {
        successPath?: string;
        type?: never;
      };
    }
);

export type MessageInputOfType<T extends MessageInput['type']> = Extract<
  MessageInput,
  { type: T }
>;

export interface MessageStoreItemTxData {
  type:
    | (typeof TRANSACTION_TYPE)['ISSUE']
    | (typeof TRANSACTION_TYPE)['TRANSFER']
    | (typeof TRANSACTION_TYPE)['REISSUE']
    | (typeof TRANSACTION_TYPE)['BURN']
    | (typeof TRANSACTION_TYPE)['LEASE']
    | (typeof TRANSACTION_TYPE)['CANCEL_LEASE']
    | (typeof TRANSACTION_TYPE)['ALIAS']
    | (typeof TRANSACTION_TYPE)['MASS_TRANSFER']
    | (typeof TRANSACTION_TYPE)['DATA']
    | (typeof TRANSACTION_TYPE)['SET_SCRIPT']
    | (typeof TRANSACTION_TYPE)['SPONSORSHIP']
    | (typeof TRANSACTION_TYPE)['SET_ASSET_SCRIPT']
    | (typeof TRANSACTION_TYPE)['INVOKE_SCRIPT']
    | (typeof TRANSACTION_TYPE)['UPDATE_ASSET_INFO']
    | (typeof TRANSACTION_TYPE)['ETHEREUM'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  referrer?: string | URL;
  binary?: string;
  lease?: TransactionFromNode;
  timestamp?: number;
  publicKey?: string;
  successPath?: string;
}

type MessageStoreItemTxPackageData = MessageStoreItemTxData[] & {
  type?: never;
  data?: never;
};

export type MessageStoreItem = {
  connectionId?: string;
  account: PreferencesAccount;
  broadcast?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err?: any;
  ext_uuid: unknown;
  id: string;
  json?: string;
  lease?: unknown;
  status: MsgStatus;
  successPath?: string | null;
  timestamp: number;
  title?: string | null;
} & (
  | {
      type: 'transaction';
      origin?: string;
      result?: string;
      messageHash: string;
      data: MessageStoreItemTxData;
    }
  | {
      type: 'transactionPackage';
      origin?: string;
      result?: string[];
      messageHash: string[];
      data: MessageStoreItemTxPackageData;
    }
  | {
      type: 'wavesAuth';
      origin?: string;
      result?: IWavesAuth;
      messageHash: string;
      data: {
        publicKey: string;
        timestamp?: number;
        type?: never;
      };
    }
  | {
      type: 'auth';
      origin?: string;
      result?:
        | string
        | {
            host: string;
            name: unknown;
            prefix: string;
            address: string;
            publicKey: string;
            signature: string;
            version: number | undefined;
          };
      messageHash: string;
      data: {
        type: 1000;
        referrer: string | undefined;
        data: {
          data: string;
          prefix: string;
          host: string;
          name: string | undefined;
          icon: string | undefined;
        };
      };
    }
  | {
      type: 'order';
      origin?: string;
      result?: string;
      messageHash: string;
      data: {
        type: 1002;
        data: {
          amount?: IMoneyLike | string | number;
          chainId: number;
          expiration: number;
          matcherFee: IMoneyLike;
          matcherPublicKey: string;
          orderType?: string;
          price?: IMoneyLike | string | number;
          senderPublicKey: string;
          timestamp: number;
        };
      };
    }
  | {
      type: 'cancelOrder';
      origin?: string;
      result?: string;
      amountAsset?: string;
      messageHash: string;
      priceAsset?: string;
      data: {
        type: 1003;
        data: {
          id: string;
          senderPublicKey: string;
          timestamp: number;
        };
      };
    }
  | {
      type: 'request';
      origin?: string;
      result?: string;
      messageHash: string;
      data: {
        type?: never;
        data: {
          senderPublicKey: string;
          timestamp: number;
        };
      };
    }
  | {
      type: 'authOrigin';
      origin: string;
      result?: { approved: 'OK' };
      messageHash?: never;
      data: {
        type?: never;
        data?: unknown;
      };
    }
  | {
      type: 'customData';
      origin?: string;
      result?: TSignedData;
      messageHash: string;
      data: TCustomData & {
        origin?: string;
        successPath?: string;
        type?: never;
      };
    }
);
