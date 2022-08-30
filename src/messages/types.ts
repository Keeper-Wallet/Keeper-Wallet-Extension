import { MsgStatus } from '../constants';
import { PreferencesAccount } from 'preferences/types';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { IWavesAuthParams } from '@waves/waves-transactions/dist/transactions';
import { IMoneyLike } from 'ui/utils/converters';

interface MessageOptions {
  getMeta?: unknown;
  uid?: unknown;
}

interface MessageInputData {
  data?: unknown;
  isRequest?: boolean;
  origin?: unknown;
  successPath?: string;
  type?: number;
}

export type MessageInput = {
  account: PreferencesAccount;
  broadcast?: boolean;
  options?: MessageOptions;
  origin?: string;
  successPath?: unknown;
  title?: string | null;
} & (
  | {
      type: 'auth';
      data: MessageInputData & {
        data?: unknown;
        host?: unknown;
        icon?: unknown;
        isRequest?: unknown;
        name?: unknown;
        referrer?: string;
      };
    }
  | {
      type: 'authOrigin';
      data: MessageInputData;
    }
  | {
      type: 'cancelOrder';
      data: MessageInputData & {
        amountAsset?: string;
        priceAsset?: string;
      };
    }
  | {
      type: 'customData';
      data: MessageInputData & {
        publicKey?: unknown;
      };
    }
  | {
      type: 'order';
      data: MessageInputData & {
        data?: {
          matcherFee?: unknown;
        };
      };
    }
  | {
      type: 'request';
      data: MessageInputData;
    }
  | {
      type: 'transaction';
      data: MessageInputData & {
        type: typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];
        data: {
          amount: IMoneyLike;
          fee?: unknown;
          recipient: string;
          attachment: string;
        };
      };
    }
  | {
      type: 'transactionPackage';
      data: MessageInputData;
    }
  | {
      type: 'wavesAuth';
      data: MessageInputData & IWavesAuthParams;
    }
);

export type MessageInputOfType<T extends MessageInput['type']> = Extract<
  MessageInput,
  { type: T }
>;

interface TxData {
  type: typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  referrer?: string | URL;
  binary?: string;
  timestamp?: number;
  publicKey?: string;
  successPath?: string;
}

export type MessageStoreItem = {
  account: PreferencesAccount;
  amountAsset?: string;
  broadcast?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err?: any;
  ext_uuid: unknown;
  id: string;
  json?: string;
  lease?: unknown;
  origin?: string;
  priceAsset?: string;
  result?: string;
  status: MsgStatus;
  successPath?: string | null;
  timestamp: number;
  title?: string;
} & (
  | {
      type: 'transaction';
      messageHash?: string | string[];
      data: TxData;
    }
  | {
      type: 'transactionPackage';
      messageHash?: string | string[];
      data: TxData[] & { type?: unknown };
    }
  | {
      type: 'wavesAuth';
      messageHash?: string | string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
  | {
      type: 'auth';
      messageHash?: string | string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
  | {
      type: 'order';
      messageHash?: string | string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
  | {
      type: 'cancelOrder';
      messageHash?: string | string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
  | {
      type: 'request';
      messageHash?: string | string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
  | {
      type: 'authOrigin';
      messageHash?: string | string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
  | {
      type: 'customData';
      messageHash?: string | string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    }
);
