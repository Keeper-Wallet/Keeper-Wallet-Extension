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

export type MessageInput = {
  connectionId?: string;
  account: PreferencesAccount;
  broadcast?: boolean;
  options?: {
    getMeta?: unknown;
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
        type?: never;
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
      data: {
        origin?: string;
        successPath?: string;
        type: (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
        data: {
          alias?: string;
          amount?: IMoneyLike | number;
          attachment?: string;
          data?: unknown;
          fee?: IMoneyLike;
          leaseId?: string;
          minSponsoredAssetFee?: unknown;
          name?: string;
          recipient?: string;
          reissuable?: boolean;
          script?: string;
        };
      };
    }
  | {
      type: 'transactionPackage';
      origin?: string;
      data: Array<{
        type: (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
        data: {
          fee?: IMoneyLike;
          leaseId?: string;
          lease?: TransactionFromNode;
        };
      }> & {
        data?: never;
        origin?: never;
        successPath?: never;
        type?: never;
      };
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

interface TxData {
  type: (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  referrer?: string | URL;
  binary?: string;
  timestamp?: number;
  publicKey?: string;
  successPath?: string;
}

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
      data: TxData;
    }
  | {
      type: 'transactionPackage';
      origin?: string;
      result?: string[];
      messageHash: string[];
      data: TxData[] & { type?: never; data?: never };
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
        type?: never;
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
