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
import { InvokeScriptCallArgument } from '@waves/ts-types/dist/src/parts';
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
import { orderToProtoBytes } from '@waves/waves-transactions/dist/proto-serialize';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import {
  TTransactionType,
  WithSender,
} from '@waves/waves-transactions/dist/transactions';
import Long from 'long';
import { PreferencesAccount } from 'preferences/types';
import { getTxVersions } from 'wallets';

import { ERRORS } from '../lib/keeperError';

type RawStringIn = string | number[];

function fromRawIn(val: RawStringIn): Uint8Array {
  if (typeof val === 'string') return stringToBytes(val);

  return Uint8Array.from(val);
}

export function processAliasOrAddress(recipient: string, chainId: number) {
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
    fee?: Money;
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
    attachment?: RawStringIn;
    fee?: Money;
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
    fee?: Money;
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
    fee?: Money;
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
    fee?: Money;
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
    fee?: Money;
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
    fee?: Money;
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
    fee?: Money;
    timestamp: number;
    attachment?: RawStringIn;
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
    fee?: Money;
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
    fee?: Money;
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
    fee?: Money;
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
    fee?: Money;
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
    fee?: Money;
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
    fee?: Money;
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
    chainId?: number;
    orderType: 'buy' | 'sell';
    version?: 1 | 2 | 3 | 4;
    amount: Money;
    price: Money;
    priceMode?: 'assetDecimals' | 'fixedDecimals';
    timestamp: number;
    expiration: number;
    matcherFee: Money;
    matcherPublicKey: string;
    senderPublicKey?: string;
    proofs?: string[];
    eip712Signature?: string;
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
    senderPublicKey: string;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function deepConvert(value: any): any {
    if (predicate(value)) {
      return converter(value);
    }

    if (Array.isArray(value)) {
      return value.map(deepConvert);
    }

    if (Object.prototype.toString.call(value) === '[object Object]') {
      return Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-shadow
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertArg(arg: InvokeScriptCallArgument): any {
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
    accountType: PreferencesAccount['type']
  ) => {
    const fallbackVersion = getTxVersions(accountType)[input.type][0];

    switch (input.type) {
      case TRANSACTION_TYPE.ISSUE: {
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          name: input.data.name,
          description: input.data.description,
          quantity: new BigNumber(input.data.quantity),
          script: input.data.script || null,
          decimals: input.data.precision,
          reissuable: input.data.reissuable,
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          chainId: input.data.chainId || defaultChainId,
          proofs: input.data.proofs || [],
        };

        try {
          return convertLongToBigNumber(issue(convertBigNumberToLong(tx)));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.TRANSFER: {
        const chainId = input.data.chainId || defaultChainId;
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          assetId: input.data.amount.asset.id,
          recipient: processAliasOrAddress(input.data.recipient, chainId),
          amount: input.data.amount.getCoins(),
          attachment: input.data.attachment
            ? base58Encode(fromRawIn(input.data.attachment))
            : '',
          fee: input.data.fee?.getCoins(),
          feeAssetId: input.data.fee?.asset.id,
          timestamp: input.data.timestamp,
          chainId,
          proofs: input.data.proofs || [],
        };

        try {
          return convertLongToBigNumber(transfer(convertBigNumberToLong(tx)));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.REISSUE: {
        const quantity = input.data.quantity || input.data.amount;
        const assetId =
          quantity instanceof Money ? quantity.asset.id : input.data.assetId;
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          assetId,
          quantity:
            quantity instanceof Money
              ? quantity.getCoins()
              : new BigNumber(quantity),
          reissuable: input.data.reissuable,
          chainId: input.data.chainId || defaultChainId,
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
        };

        try {
          return convertLongToBigNumber(reissue(convertBigNumberToLong(tx)));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.BURN: {
        const quantity = input.data.quantity || input.data.amount;
        const assetId =
          quantity instanceof Money ? quantity.asset.id : input.data.assetId;
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          assetId,
          amount:
            quantity instanceof Money
              ? quantity.getCoins()
              : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                new BigNumber(quantity!),
          chainId: input.data.chainId || defaultChainId,
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
        };

        try {
          return convertLongToBigNumber(burn(convertBigNumberToLong(tx)));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.LEASE: {
        const chainId = input.data.chainId || defaultChainId;
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          amount:
            input.data.amount instanceof Money
              ? input.data.amount.getCoins()
              : new BigNumber(input.data.amount),
          recipient: processAliasOrAddress(input.data.recipient, chainId),
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
          chainId,
        };

        try {
          return convertLongToBigNumber(lease(convertBigNumberToLong(tx)));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.CANCEL_LEASE: {
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          leaseId: input.data.leaseId,
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          chainId: input.data.chainId || defaultChainId,
          proofs: input.data.proofs || [],
        };

        try {
          return convertLongToBigNumber(
            cancelLease(convertBigNumberToLong(tx))
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.ALIAS: {
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          alias: input.data.alias,
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          chainId: input.data.chainId || defaultChainId,
          proofs: input.data.proofs || [],
        };

        try {
          return convertLongToBigNumber(alias(convertBigNumberToLong(tx)));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.MASS_TRANSFER: {
        const chainId = input.data.chainId || defaultChainId;
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          assetId: input.data.totalAmount.asset.id,
          // eslint-disable-next-line @typescript-eslint/no-shadow
          transfers: input.data.transfers.map(transfer => ({
            amount: new BigNumber(transfer.amount),
            recipient: processAliasOrAddress(transfer.recipient, chainId),
          })),
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          attachment: input.data.attachment
            ? base58Encode(fromRawIn(input.data.attachment))
            : '',
          proofs: input.data.proofs || [],
          chainId,
        };

        try {
          return convertLongToBigNumber(
            massTransfer(convertBigNumberToLong(tx))
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.DATA: {
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
          chainId: input.data.chainId || defaultChainId,
          data: input.data.data.map(item => {
            if (item.type === 'integer') {
              const { value } = item;

              const valueForErr =
                typeof value === 'string'
                  ? value === ''
                    ? '<empty string>'
                    : `'${value}'`
                  : String(value);

              if (typeof value !== 'string' && typeof value !== 'number') {
                throw ERRORS.REQUEST_ERROR(
                  `expected string or number for '${item.key}' data key, received: ${valueForErr}`,
                  input
                );
              }

              const valueBn = new BigNumber(value);

              if (!valueBn.isInt()) {
                throw ERRORS.REQUEST_ERROR(
                  `'${item.key}' data key value must be a string or number representing an integer, received: ${valueForErr}`,
                  input
                );
              }

              return { ...item, value: valueBn };
            }

            return item;
          }),
        };

        try {
          return convertLongToBigNumber(data(convertBigNumberToLong(tx)));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.SET_SCRIPT: {
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          chainId: input.data.chainId || defaultChainId,
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
          script: input.data.script || null,
        };

        try {
          return convertLongToBigNumber(setScript(convertBigNumberToLong(tx)));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.SPONSORSHIP: {
        const minSponsoredAssetFee = input.data.minSponsoredAssetFee.getCoins();

        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          minSponsoredAssetFee: minSponsoredAssetFee.eq(0)
            ? null
            : minSponsoredAssetFee,
          assetId: input.data.minSponsoredAssetFee.asset.id,
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          chainId: input.data.chainId || defaultChainId,
          proofs: input.data.proofs || [],
        };

        try {
          return convertLongToBigNumber(
            sponsorship(convertBigNumberToLong(tx))
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.SET_ASSET_SCRIPT: {
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          assetId: input.data.assetId,
          chainId: input.data.chainId || defaultChainId,
          fee: input.data.fee?.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
          script: input.data.script,
        };

        try {
          return convertLongToBigNumber(
            setAssetScript(convertBigNumberToLong(tx))
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.INVOKE_SCRIPT: {
        const chainId = input.data.chainId || defaultChainId;
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          dApp: processAliasOrAddress(input.data.dApp, chainId),
          call: input.data.call
            ? {
                ...input.data.call,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any
                args: input.data.call.args!.map(convertArg as any),
              }
            : undefined,
          payment: input.data.payment.map(payment => ({
            amount: payment.getCoins(),
            assetId: payment.asset.id,
          })),
          fee: input.data.fee?.getCoins(),
          feeAssetId: input.data.fee?.asset.id,
          timestamp: input.data.timestamp,
          chainId,
          proofs: input.data.proofs || [],
        };

        try {
          return convertLongToBigNumber(
            invokeScript(convertBigNumberToLong(tx))
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      case TRANSACTION_TYPE.UPDATE_ASSET_INFO: {
        const tx = {
          version: input.data.version || fallbackVersion,
          senderPublicKey: input.data.senderPublicKey,
          name: input.data.name,
          description: input.data.description,
          assetId: input.data.assetId,
          fee: input.data.fee?.getCoins().toNumber(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
          chainId: input.data.chainId || defaultChainId,
        };

        try {
          return convertLongToBigNumber(
            updateAssetInfo(convertBigNumberToLong(tx))
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          throw ERRORS.REQUEST_ERROR(e.message, input);
        }
      }
      default:
        throw ERRORS.REQUEST_ERROR(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `unexpected type: ${(input as any).type}`,
          input
        );
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
  order: (input: SaOrder, defaultChainId: number) => {
    const version = input.data.version || 3;

    return convertLongToBigNumber(
      order(
        convertBigNumberToLong({
          chainId: input.data.chainId || defaultChainId,
          orderType: input.data.orderType,
          version,
          assetPair: {
            amountAsset: input.data.amount.asset.id,
            priceAsset: input.data.price.asset.id,
          },
          price: input.data.price
            .getTokens()
            .mul(
              new BigNumber(10).pow(
                version < 4 || input.data.priceMode === 'assetDecimals'
                  ? 8 +
                      input.data.price.asset.precision -
                      input.data.amount.asset.precision
                  : 8
              )
            ),
          priceMode: input.data.priceMode ?? 'fixedDecimals',
          amount: input.data.amount.getCoins(),
          timestamp: input.data.timestamp,
          expiration: input.data.expiration,
          matcherFee: input.data.matcherFee.getCoins(),
          matcherPublicKey: input.data.matcherPublicKey,
          senderPublicKey: input.data.senderPublicKey,
          proofs: input.data.proofs || [],
          matcherFeeAssetId: input.data.matcherFee.asset.id,
          eip712Signature: input.data.eip712Signature,
        })
      )
    );
  },
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
  order: (arg: ReturnType<(typeof convertFromSa)['order']>) =>
    arg.version < 4
      ? binary.serializeOrder(arg)
      : orderToProtoBytes(convertBigNumberToLong(arg)),
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
