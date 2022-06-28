import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { binary, serializePrimitives } from '@waves/marshall';
import {
  base58Encode,
  blake2b,
  concat,
  stringToBytes,
} from '@waves/ts-lib-crypto';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import {
  alias,
  burn,
  cancelLease,
  cancelOrder,
  data,
  invokeScript,
  issue,
  lease,
  makeTxBytes,
  massTransfer,
  order,
  reissue,
  setAssetScript,
  setScript,
  sponsorship,
  transfer,
  updateAssetInfo,
  validators,
} from '@waves/waves-transactions';
import { TTxParamsWithType } from '@waves/waves-transactions/dist/make-tx';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import {
  TTransactionType,
  WithSender,
} from '@waves/waves-transactions/dist/transactions';
import { AccountType } from 'accounts/types';
import Long from 'long';
import { getTxVersions } from 'wallets';
import { InvokeScriptCallArgument } from '@waves/ts-types/dist/src/parts';
import {
  isValidEthereumAddress,
  fromEthereumToWavesAddress,
} from 'ui/utils/ethereum';

export function processAliasOrAddress(recipient: string, chainId: number) {
  if (isValidEthereumAddress(recipient)) {
    return fromEthereumToWavesAddress(recipient, chainId);
  }

  return validators.isValidAddress(recipient) ||
    validators.isValidAlias(recipient)
    ? recipient
    : `alias:${String.fromCharCode(chainId)}:${recipient}`;
}

interface SaIssue {
  type: typeof TRANSACTION_TYPE.ISSUE;
  data: {
    version?: number;
    senderPublicKey?: string;
    name: string;
    description: string;
    quantity: string | number | BigNumber;
    script?: string;
    precision: number;
    reissuable: boolean;
    fee: Money;
    timestamp: number;
    chainId?: number;
    proofs?: string[];
  };
}

interface SaTransfer {
  type: typeof TRANSACTION_TYPE.TRANSFER;
  data: {
    version?: number;
    senderPublicKey?: string;
    amount: Money;
    recipient: string;
    attachment?: string;
    fee: Money;
    timestamp: number;
    chainId?: number;
    proofs?: string[];
  };
}

interface SaReissue {
  type: typeof TRANSACTION_TYPE.REISSUE;
  data: {
    version?: number;
    senderPublicKey?: string;
    amount: string | number | BigNumber | Money;
    assetId: string;
    quantity: string | number | BigNumber | Money;
    reissuable: boolean;
    chainId?: number;
    fee: Money;
    timestamp: number;
    proofs?: string[];
  };
}

interface SaBurn {
  type: typeof TRANSACTION_TYPE.BURN;
  data: {
    version?: number;
    senderPublicKey?: string;
    assetId: string;
    amount?: string | BigNumber;
    quantity?: string | BigNumber;
    chainId?: number;
    fee: Money;
    timestamp: number;
    proofs?: string[];
  };
}

interface SaLease {
  type: typeof TRANSACTION_TYPE.LEASE;
  data: {
    version?: number;
    senderPublicKey?: string;
    amount: string | BigNumber | Money;
    recipient: string;
    fee: Money;
    timestamp: number;
    proofs?: string[];
    chainId?: number;
  };
}

interface SaCancelLease {
  type: typeof TRANSACTION_TYPE.CANCEL_LEASE;
  data: {
    version?: number;
    senderPublicKey?: string;
    leaseId: string;
    fee: Money;
    timestamp: number;
    chainId?: number;
    proofs?: string[];
  };
}

interface SaAlias {
  type: typeof TRANSACTION_TYPE.ALIAS;
  data: {
    version?: number;
    senderPublicKey?: string;
    alias: string;
    fee: Money;
    timestamp: number;
    chainId?: number;
    proofs?: string[];
  };
}

interface SaMassTransfer {
  type: typeof TRANSACTION_TYPE.MASS_TRANSFER;
  data: {
    version?: number;
    senderPublicKey?: string;
    totalAmount: Money;
    transfers: Array<{
      recipient: string;
      amount: string | number | BigNumber;
    }>;
    fee: Money;
    timestamp: number;
    attachment?: string;
    proofs?: string[];
    chainId?: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyValue = any;

interface SaData {
  type: typeof TRANSACTION_TYPE.DATA;
  data: {
    version?: number;
    senderPublicKey?: string;
    fee: Money;
    timestamp: number;
    proofs?: string[];
    chainId?: number;
    data: Array<{
      key: string;
      type: string;
      value: AnyValue;
    }>;
  };
}

interface SaSetScript {
  type: typeof TRANSACTION_TYPE.SET_SCRIPT;
  data: {
    version?: number;
    senderPublicKey?: string;
    chainId?: number;
    fee: Money;
    timestamp: number;
    proofs?: string[];
    script: string;
  };
}

interface SaSponsorship {
  type: typeof TRANSACTION_TYPE.SPONSORSHIP;
  data: {
    version?: number;
    senderPublicKey?: string;
    minSponsoredAssetFee: Money;
    fee: Money;
    timestamp: number;
    chainId?: number;
    proofs?: string[];
  };
}

interface SaSetAssetScript {
  type: typeof TRANSACTION_TYPE.SET_ASSET_SCRIPT;
  data: {
    version?: number;
    senderPublicKey?: string;
    assetId: string;
    chainId?: number;
    fee: Money;
    timestamp: number;
    proofs?: string[];
    script: string;
  };
}

interface SaInvokeScript {
  type: typeof TRANSACTION_TYPE.INVOKE_SCRIPT;
  data: {
    version?: number;
    senderPublicKey?: string;
    dApp: string;
    call: {
      function: string;
      args?: Array<{
        type: string;
        value: AnyValue;
      }>;
    } | null;
    payment: Money[];
    fee: Money;
    timestamp: number;
    chainId?: number;
    proofs?: string[];
  };
}

interface SaUpdateAssetInfo {
  type: typeof TRANSACTION_TYPE.UPDATE_ASSET_INFO;
  data: {
    version?: number;
    senderPublicKey?: string;
    name: string;
    description: string;
    assetId: string;
    fee: Money;
    timestamp: number;
    proofs?: string[];
    chainId?: number;
  };
}

export type SaTransaction =
  | SaIssue
  | SaTransfer
  | SaReissue
  | SaBurn
  | SaLease
  | SaCancelLease
  | SaAlias
  | SaMassTransfer
  | SaData
  | SaSetScript
  | SaSponsorship
  | SaSetAssetScript
  | SaInvokeScript
  | SaUpdateAssetInfo;

export interface SaOrder {
  data: {
    orderType: 'buy' | 'sell';
    version?: 1 | 2 | 3 | 4;
    amount: Money;
    price: Money;
    timestamp: number;
    expiration: number;
    matcherFee: Money;
    matcherPublicKey: string;
    senderPublicKey?: string;
    proofs?: string[];
  };
}

export interface SaCancelOrder {
  data: {
    id: string;
    senderPublicKey?: string;
  };
}

export interface SaAuth {
  type: 1000;
  data: {
    prefix: string;
    host: string;
    data: string;
    timestamp?: number;
    version?: number;
    proofs?: string[];
  };
}

export interface SaRequest {
  data: {
    senderPublicKey?: string;
    timestamp: number;
  };
}

interface NativeAuth {
  data: string;
  host: string;
}

interface NativeRequest {
  senderPublicKey: string;
  timestamp: number;
}

function createDeepConverter<TFrom, TTo>(
  predicate: (value: unknown) => value is TFrom,
  converter: (value: TFrom) => TTo
) {
  function deepConvert(value: unknown) {
    if (predicate(value)) {
      return converter(value);
    }

    if (Array.isArray(value)) {
      return value.map(deepConvert);
    }

    if (Object.prototype.toString.call(value) === '[object Object]') {
      return Object.fromEntries(
        Object.entries(value).map(([key, value]) => [key, deepConvert(value)])
      );
    }

    return value;
  }

  return deepConvert;
}

const convertBigNumberToLong = createDeepConverter(
  BigNumber.isBigNumber,
  value => Long.fromValue(value.toString())
);

const convertLongToBigNumber = createDeepConverter(
  Long.isLong,
  value => new BigNumber(value.toString())
);

function convertArg(arg: InvokeScriptCallArgument) {
  return arg.type === 'integer'
    ? { ...arg, value: new BigNumber(arg.value) }
    : arg.type === 'list'
    ? { ...arg, value: arg.value.map(convertArg) }
    : arg;
}

export const convertFromSa = {
  transaction: (
    input: SaTransaction,
    defaultChainId: number,
    accountType: AccountType
  ) => {
    const fallbackVersion = getTxVersions(accountType)[input.type][0];

    switch (input.type) {
      case TRANSACTION_TYPE.ISSUE:
        return convertLongToBigNumber(
          issue(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              name: input.data.name,
              description: input.data.description,
              quantity: new BigNumber(input.data.quantity),
              script: input.data.script || null,
              decimals: input.data.precision,
              reissuable: input.data.reissuable,
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              chainId: input.data.chainId || defaultChainId,
              proofs: input.data.proofs || [],
            })
          )
        );
      case TRANSACTION_TYPE.TRANSFER: {
        const chainId = input.data.chainId || defaultChainId;

        return convertLongToBigNumber(
          transfer(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              assetId: input.data.amount.asset.id,
              recipient: processAliasOrAddress(input.data.recipient, chainId),
              amount: input.data.amount.getCoins(),
              attachment: input.data.attachment
                ? base58Encode(stringToBytes(input.data.attachment))
                : '',
              fee: input.data.fee.getCoins(),
              feeAssetId: input.data.fee.asset.id,
              timestamp: input.data.timestamp,
              chainId,
              proofs: input.data.proofs || [],
            })
          )
        );
      }
      case TRANSACTION_TYPE.REISSUE: {
        const quantity = input.data.quantity || input.data.amount;
        const assetId =
          quantity instanceof Money ? quantity.asset.id : input.data.assetId;

        return convertLongToBigNumber(
          reissue(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              assetId,
              quantity:
                quantity instanceof Money
                  ? quantity.getCoins()
                  : new BigNumber(quantity),
              reissuable: input.data.reissuable,
              chainId: input.data.chainId || defaultChainId,
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              proofs: input.data.proofs || [],
            })
          )
        );
      }
      case TRANSACTION_TYPE.BURN: {
        const quantity = input.data.quantity || input.data.amount;
        const assetId =
          quantity instanceof Money ? quantity.asset.id : input.data.assetId;

        return convertLongToBigNumber(
          burn(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              assetId,
              amount:
                quantity instanceof Money
                  ? quantity.getCoins()
                  : new BigNumber(quantity),
              chainId: input.data.chainId || defaultChainId,
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              proofs: input.data.proofs || [],
            })
          )
        );
      }
      case TRANSACTION_TYPE.LEASE: {
        const chainId = input.data.chainId || defaultChainId;

        return convertLongToBigNumber(
          lease(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              amount:
                input.data.amount instanceof Money
                  ? input.data.amount.getCoins()
                  : new BigNumber(input.data.amount),
              recipient: processAliasOrAddress(input.data.recipient, chainId),
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              proofs: input.data.proofs || [],
              chainId,
            })
          )
        );
      }
      case TRANSACTION_TYPE.CANCEL_LEASE:
        return convertLongToBigNumber(
          cancelLease(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              leaseId: input.data.leaseId,
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              chainId: input.data.chainId || defaultChainId,
              proofs: input.data.proofs || [],
            })
          )
        );
      case TRANSACTION_TYPE.ALIAS:
        return convertLongToBigNumber(
          alias(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              alias: input.data.alias,
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              chainId: input.data.chainId || defaultChainId,
              proofs: input.data.proofs || [],
            })
          )
        );
      case TRANSACTION_TYPE.MASS_TRANSFER: {
        const chainId = input.data.chainId || defaultChainId;

        return convertLongToBigNumber(
          massTransfer(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              assetId: input.data.totalAmount.asset.id,
              transfers: input.data.transfers.map(transfer => ({
                amount: new BigNumber(transfer.amount),
                recipient: processAliasOrAddress(transfer.recipient, chainId),
              })),
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              attachment: input.data.attachment
                ? base58Encode(stringToBytes(input.data.attachment))
                : '',
              proofs: input.data.proofs || [],
              chainId,
            })
          )
        );
      }
      case TRANSACTION_TYPE.DATA:
        return convertLongToBigNumber(
          data(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              proofs: input.data.proofs || [],
              chainId: input.data.chainId || defaultChainId,
              data: input.data.data.map(item =>
                item.type === 'integer'
                  ? { ...item, value: new BigNumber(item.value) }
                  : item
              ),
            })
          )
        );
      case TRANSACTION_TYPE.SET_SCRIPT:
        return convertLongToBigNumber(
          setScript(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              chainId: input.data.chainId || defaultChainId,
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              proofs: input.data.proofs || [],
              script: input.data.script || null,
            })
          )
        );
      case TRANSACTION_TYPE.SPONSORSHIP:
        return convertLongToBigNumber(
          sponsorship(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              minSponsoredAssetFee: input.data.minSponsoredAssetFee.getCoins(),
              assetId: input.data.minSponsoredAssetFee.asset.id,
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              chainId: input.data.chainId || defaultChainId,
              proofs: input.data.proofs || [],
            })
          )
        );
      case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
        return convertLongToBigNumber(
          setAssetScript(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              assetId: input.data.assetId,
              chainId: input.data.chainId || defaultChainId,
              fee: input.data.fee.getCoins(),
              timestamp: input.data.timestamp,
              proofs: input.data.proofs || [],
              script: input.data.script,
            })
          )
        );
      case TRANSACTION_TYPE.INVOKE_SCRIPT: {
        const chainId = input.data.chainId || defaultChainId;

        return convertLongToBigNumber(
          invokeScript(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              dApp: processAliasOrAddress(input.data.dApp, chainId),
              call: input.data.call
                ? {
                    ...input.data.call,
                    args: input.data.call.args.map(convertArg),
                  }
                : undefined,
              payment: input.data.payment.map(payment => ({
                amount: payment.getCoins(),
                assetId: payment.asset.id,
              })),
              fee: input.data.fee.getCoins(),
              feeAssetId: input.data.fee.asset.id,
              timestamp: input.data.timestamp,
              chainId,
              proofs: input.data.proofs || [],
            })
          )
        );
      }
      case TRANSACTION_TYPE.UPDATE_ASSET_INFO:
        return convertLongToBigNumber(
          updateAssetInfo(
            convertBigNumberToLong({
              version: input.data.version || fallbackVersion,
              senderPublicKey: input.data.senderPublicKey,
              name: input.data.name,
              description: input.data.description,
              assetId: input.data.assetId,
              fee: input.data.fee.getCoins().toNumber(),
              feeAssetId: input.data.fee.asset.id,
              timestamp: input.data.timestamp,
              proofs: input.data.proofs || [],
              chainId: input.data.chainId || defaultChainId,
            })
          )
        );
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`Unexpected type: ${(input as any).type}`);
    }
  },
  auth: (input: SaAuth): NativeAuth => ({
    data: input.data.data,
    host: input.data.host,
  }),
  request: (request: SaRequest): NativeRequest => ({
    senderPublicKey: request.data.senderPublicKey,
    timestamp: request.data.timestamp,
  }),
  order: (input: SaOrder) =>
    order({
      orderType: input.data.orderType,
      version: input.data.version || 3,
      assetPair: {
        amountAsset: input.data.amount.asset.id,
        priceAsset: input.data.price.asset.id,
      },
      price: input.data.price
        .getTokens()
        .mul(
          new BigNumber(10).pow(
            8 +
              input.data.price.asset.precision -
              input.data.amount.asset.precision
          )
        ),
      amount: input.data.amount.getCoins(),
      timestamp: input.data.timestamp,
      expiration: input.data.expiration,
      matcherFee: input.data.matcherFee.getCoins(),
      matcherPublicKey: input.data.matcherPublicKey,
      senderPublicKey: input.data.senderPublicKey,
      proofs: input.data.proofs || [],
      matcherFeeAssetId: input.data.matcherFee.asset.id,
    } as never),
  cancelOrder: (input: SaCancelOrder) =>
    cancelOrder({
      orderId: input.data.id,
      senderPublicKey: input.data.senderPublicKey,
    }),
};

export const makeBytes = {
  transaction: <T extends TTransactionType>(
    tx: TTxParamsWithType<T> & WithSender & { version: number }
  ) => makeTxBytes<T>(convertBigNumberToLong(tx)),
  auth: serializeAuthData,
  request: (input: NativeRequest) =>
    concat(
      serializePrimitives.BASE58_STRING(input.senderPublicKey),
      serializePrimitives.LONG(input.timestamp)
    ),
  order: binary.serializeOrder,
  cancelOrder: cancelOrderParamsToBytes,
};

const hash = (bytes: Uint8Array | number[]) => base58Encode(blake2b(bytes));

export const getHash = {
  transaction: (bytes: Uint8Array) =>
    hash(bytes[0] === 10 ? [bytes[0], ...bytes.slice(36, -16)] : bytes),
  auth: hash,
  request: hash,
  order: hash,
};
