import {
  base16Decode,
  base58Decode,
  base58Encode,
  base64Decode,
  blake2b,
  createAddress,
  verifyAddress,
} from '@keeper-wallet/waves-crypto';
import { BigNumber } from '@waves/bignumber';
import { binary, schemas, serializePrimitives } from '@waves/marshall';
import { waves } from '@waves/protobuf-serialization';
import type { InvokeScriptCallArgument } from '@waves/ts-types';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import Long from 'long';

import { JSONbn } from '../_core/jsonBn';
import {
  type MessageInputCustomData,
  type MessageOrder,
  type MessageTx,
  type MessageTxAlias,
  type MessageTxBurn,
  type MessageTxCancelLease,
  type MessageTxData,
  type MessageTxInvokeScript,
  type MessageTxIssue,
  type MessageTxLease,
  type MessageTxMassTransfer,
  type MessageTxReissue,
  type MessageTxSetAssetScript,
  type MessageTxSetScript,
  type MessageTxSponsorship,
  type MessageTxTransfer,
  type MessageTxUpdateAssetInfo,
} from './types';

export function isAddressString(input: string, chainId?: number) {
  try {
    return verifyAddress(base58Decode(input), { chainId });
  } catch (err) {
    return false;
  }
}

export function isAlias(input: string) {
  const parts = input.split(':');

  return (
    parts.length === 3 &&
    parts[0] === 'alias' &&
    /^[-_.@0-9a-z]{4,30}$/.test(parts[2])
  );
}

export function isBase58(input: string) {
  try {
    base58Decode(input);
    return true;
  } catch {
    return false;
  }
}

export function processAliasOrAddress(recipient: string, chainId: number) {
  return isAddressString(recipient) || isAlias(recipient)
    ? recipient
    : `alias:${String.fromCharCode(chainId)}:${recipient}`;
}

export function makeAuthBytes(data: { host: string; data: string }) {
  return Uint8Array.of(
    ...serializePrimitives.LEN(serializePrimitives.SHORT)(
      serializePrimitives.STRING,
    )('WavesWalletAuthentication'),
    ...serializePrimitives.LEN(serializePrimitives.SHORT)(
      serializePrimitives.STRING,
    )(data.host || ''),
    ...serializePrimitives.LEN(serializePrimitives.SHORT)(
      serializePrimitives.STRING,
    )(data.data || ''),
  );
}

export function makeCancelOrderBytes(data: {
  sender: string;
  orderId: string;
}) {
  return Uint8Array.of(
    ...base58Decode(data.sender),
    ...base58Decode(data.orderId),
  );
}

export function makeCustomDataBytes(data: MessageInputCustomData) {
  if (data.version === 1) {
    return Uint8Array.of(
      0xff,
      0xff,
      0xff,
      data.version,
      ...base64Decode(data.binary.replace(/^base64:/, '')),
    );
  } else if (data.version === 2) {
    return Uint8Array.of(
      0xff,
      0xff,
      0xff,
      data.version,
      ...binary.serializerFromSchema(schemas.txFields.data[1])(data.data),
    );
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error(`Invalid CustomData version: ${(data as any).version}`);
  }
}

function amountToProto(
  amount: string | number,
  assetId?: string | null,
): waves.IAmount {
  return {
    amount: amount === 0 ? null : Long.fromValue(amount),
    assetId: assetId == null ? null : base58Decode(assetId),
  };
}

function recipientToProto(recipient: string): waves.IRecipient {
  return {
    alias: recipient.startsWith('alias') ? recipient.slice(8) : undefined,
    publicKeyHash: recipient.startsWith('alias')
      ? undefined
      : base58Decode(recipient).slice(2, -4),
  };
}

export function makeOrderBytes(
  order: Omit<MessageOrder, 'id' | 'proofs'> &
    Partial<Pick<MessageOrder, 'id' | 'proofs'>>,
) {
  return order.version < 4
    ? binary.serializeOrder(order)
    : waves.Order.encode({
        ...order,
        amount: Long.fromValue(order.amount),
        assetPair: {
          amountAssetId: order.assetPair.amountAsset
            ? base58Decode(order.assetPair.amountAsset)
            : null,
          priceAssetId: order.assetPair.priceAsset
            ? base58Decode(order.assetPair.priceAsset)
            : null,
        },
        eip712Signature: order.eip712Signature
          ? base16Decode(order.eip712Signature.slice(2))
          : undefined,
        expiration: Long.fromValue(order.expiration),
        matcherFee: amountToProto(order.matcherFee, order.matcherFeeAssetId),
        matcherPublicKey: base58Decode(order.matcherPublicKey),
        orderSide: {
          buy: undefined,
          sell: waves.Order.Side.SELL,
        }[order.orderType],
        price: Long.fromValue(order.price),
        priceMode:
          order.version === 4
            ? {
                assetDecimals: waves.Order.PriceMode.ASSET_DECIMALS,
                fixedDecimals: waves.Order.PriceMode.FIXED_DECIMALS,
              }[order.priceMode]
            : undefined,
        proofs: order.proofs?.map(base58Decode),
        senderPublicKey: base58Decode(order.senderPublicKey),
        timestamp: Long.fromValue(order.timestamp),
      }).finish();
}

export function makeRequestBytes(request: {
  senderPublicKey: string;
  timestamp: number;
}) {
  return Uint8Array.of(
    ...serializePrimitives.BASE58_STRING(request.senderPublicKey),
    ...serializePrimitives.LONG(request.timestamp),
  );
}

export function makeWavesAuthBytes(data: {
  publicKey: string;
  timestamp: number;
}) {
  return Uint8Array.of(
    ...base58Decode(data.publicKey),
    ...serializePrimitives.LONG(data.timestamp),
  );
}

export function makeTxBytes(
  tx:
    | Omit<MessageTxIssue, 'id' | 'initialFee' | 'proofs'>
    | Omit<
        MessageTxTransfer,
        'id' | 'initialFee' | 'initialFeeAssetId' | 'proofs'
      >
    | Omit<MessageTxReissue, 'id' | 'initialFee' | 'proofs'>
    | Omit<MessageTxBurn, 'id' | 'initialFee' | 'proofs'>
    | Omit<MessageTxLease, 'id' | 'initialFee' | 'proofs'>
    | Omit<MessageTxCancelLease, 'id' | 'initialFee' | 'lease' | 'proofs'>
    | Omit<MessageTxAlias, 'id' | 'initialFee' | 'proofs'>
    | Omit<MessageTxMassTransfer, 'id' | 'initialFee' | 'proofs'>
    | Omit<MessageTxData, 'id' | 'initialFee' | 'proofs'>
    | Omit<MessageTxSetScript, 'id' | 'initialFee' | 'proofs'>
    | Omit<MessageTxSponsorship, 'id' | 'initialFee' | 'proofs'>
    | Omit<MessageTxSetAssetScript, 'id' | 'initialFee' | 'proofs'>
    | Omit<
        MessageTxInvokeScript,
        'id' | 'initialFee' | 'initialFeeAssetId' | 'proofs'
      >
    | Omit<MessageTxUpdateAssetInfo, 'id' | 'initialFee' | 'proofs'>,
) {
  const protobufCommon = {
    chainId: tx.chainId,
    senderPublicKey: base58Decode(tx.senderPublicKey),
    timestamp: Long.fromValue(tx.timestamp),
    version: tx.version,
  };

  switch (tx.type) {
    case TRANSACTION_TYPE.ISSUE:
      return tx.version < 3
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            issue: {
              amount: Long.fromValue(tx.quantity),
              decimals: tx.decimals || null,
              description: tx.description || null,
              name: tx.name,
              reissuable: tx.reissuable || undefined,
              script: tx.script
                ? base64Decode(tx.script.replace(/^base64:/, ''))
                : null,
            },
          }).finish();
    case TRANSACTION_TYPE.TRANSFER:
      return tx.version < 3
        ? binary.serializeTx({ ...tx, attachment: tx.attachment ?? '' })
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee, tx.feeAssetId),
            transfer: {
              amount: amountToProto(tx.amount, tx.assetId),
              attachment: tx.attachment
                ? base58Decode(tx.attachment)
                : undefined,
              recipient: recipientToProto(tx.recipient),
            },
          }).finish();
    case TRANSACTION_TYPE.REISSUE:
      return tx.version < 3
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            reissue: {
              assetAmount: amountToProto(tx.quantity, tx.assetId),
              reissuable: tx.reissuable || undefined,
            },
          }).finish();
    case TRANSACTION_TYPE.BURN:
      return tx.version < 3
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            burn: {
              assetAmount: amountToProto(tx.amount, tx.assetId),
            },
          }).finish();
    case TRANSACTION_TYPE.LEASE:
      return tx.version < 3
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            lease: {
              amount: Long.fromValue(tx.amount),
              recipient: recipientToProto(tx.recipient),
            },
          }).finish();
    case TRANSACTION_TYPE.CANCEL_LEASE:
      return tx.version < 3
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            leaseCancel: {
              leaseId: base58Decode(tx.leaseId),
            },
          }).finish();
    case TRANSACTION_TYPE.ALIAS:
      return tx.version < 3
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            createAlias: tx,
          }).finish();
    case TRANSACTION_TYPE.MASS_TRANSFER:
      return tx.version < 2
        ? binary.serializeTx({ ...tx, attachment: tx.attachment ?? '' })
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            massTransfer: {
              assetId: tx.assetId == null ? null : base58Decode(tx.assetId),
              attachment: !tx.attachment
                ? undefined
                : base58Decode(tx.attachment),
              transfers: tx.transfers.map(transfer => ({
                recipient: recipientToProto(transfer.recipient),
                amount: Long.fromValue(transfer.amount),
              })),
            },
          }).finish();
    case TRANSACTION_TYPE.DATA:
      return tx.version < 2
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            dataTransaction: {
              data: tx.data.map(entry => ({
                binaryValue:
                  entry.type === 'binary'
                    ? base64Decode(entry.value.replace(/^base64:/, ''))
                    : undefined,
                boolValue: entry.type === 'boolean' ? entry.value : undefined,
                intValue:
                  entry.type === 'integer'
                    ? Long.fromValue(entry.value)
                    : undefined,
                key: entry.key,
                stringValue: entry.type === 'string' ? entry.value : undefined,
              })),
            },
          }).finish();
    case TRANSACTION_TYPE.SET_SCRIPT:
      return tx.version < 2
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            setScript: {
              script: tx.script
                ? base64Decode(tx.script.replace(/^base64:/, ''))
                : null,
            },
          }).finish();
    case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
      return tx.version < 2
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            setAssetScript: {
              assetId: base58Decode(tx.assetId),
              script: tx.script
                ? base64Decode(tx.script.replace(/^base64:/, ''))
                : null,
            },
          }).finish();
    case TRANSACTION_TYPE.SPONSORSHIP:
      return tx.version < 2
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee),
            sponsorFee: {
              minFee:
                tx.minSponsoredAssetFee === null
                  ? amountToProto(0, tx.assetId)
                  : amountToProto(tx.minSponsoredAssetFee, tx.assetId),
            },
          }).finish();
    case TRANSACTION_TYPE.INVOKE_SCRIPT:
      return tx.version < 2
        ? binary.serializeTx(tx)
        : waves.Transaction.encode({
            ...protobufCommon,
            fee: amountToProto(tx.fee, tx.feeAssetId),
            invokeScript: {
              dApp: recipientToProto(tx.dApp),
              functionCall: binary.serializerFromSchema(
                schemas.txFields.functionCall[1],
              )(tx.call),
              payments: tx.payment.map(({ amount, assetId }) =>
                amountToProto(amount, assetId),
              ),
            },
          }).finish();
    case TRANSACTION_TYPE.UPDATE_ASSET_INFO:
      return waves.Transaction.encode({
        ...protobufCommon,
        fee: amountToProto(tx.fee),
        updateAssetInfo: {
          assetId: base58Decode(tx.assetId),
          description: tx.description || null,
          name: tx.name,
        },
      }).finish();
  }
}

export function computeHash(bytes: Uint8Array) {
  return blake2b(bytes);
}

export function computeTxHash(bytes: Uint8Array) {
  return computeHash(
    bytes[0] === TRANSACTION_TYPE.ALIAS
      ? Uint8Array.of(bytes[0], ...bytes.slice(36, -16))
      : bytes,
  );
}

export function stringifyOrder(
  order: MessageOrder,
  { pretty }: { pretty?: boolean } = {},
) {
  const { amount, matcherFee, price, ...otherProps } = order;

  return JSONbn.stringify(
    {
      amount: new BigNumber(amount),
      price: new BigNumber(price),
      matcherFee: new BigNumber(matcherFee),
      sender: base58Encode(
        createAddress(base58Decode(order.senderPublicKey), order.chainId),
      ),
      ...otherProps,
    },
    undefined,
    pretty ? 2 : undefined,
  );
}

function prepareTransactionForJson(tx: MessageTx) {
  const sender = base58Encode(
    createAddress(base58Decode(tx.senderPublicKey), tx.chainId),
  );

  switch (tx.type) {
    case TRANSACTION_TYPE.ISSUE: {
      const { fee, initialFee, quantity, ...otherProps } = tx;

      return {
        quantity: new BigNumber(quantity),
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.TRANSFER: {
      const { amount, fee, initialFee, initialFeeAssetId, ...otherProps } = tx;

      return {
        amount: new BigNumber(amount),
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.REISSUE: {
      const { fee, initialFee, quantity, ...otherProps } = tx;

      return {
        quantity: new BigNumber(quantity),
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.BURN: {
      const { amount, fee, initialFee, ...otherProps } = tx;

      return {
        fee: new BigNumber(fee),
        amount: new BigNumber(amount),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.LEASE: {
      const { amount, fee, initialFee, ...otherProps } = tx;

      return {
        amount: new BigNumber(amount),
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.CANCEL_LEASE: {
      const { fee, initialFee, lease, ...otherProps } = tx;

      return {
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.MASS_TRANSFER: {
      const { fee, initialFee, transfers, ...otherProps } = tx;

      return {
        transfers: transfers.map(({ amount, recipient }) => ({
          amount: new BigNumber(amount),
          recipient,
        })),
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.DATA: {
      const { data, fee, initialFee, ...otherProps } = tx;

      return {
        data: data.map(entry =>
          entry.type === 'integer'
            ? { ...entry, value: new BigNumber(entry.value) }
            : entry,
        ),
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.SPONSORSHIP: {
      const { fee, initialFee, minSponsoredAssetFee, ...otherProps } = tx;

      return {
        minSponsoredAssetFee:
          minSponsoredAssetFee == null
            ? null
            : new BigNumber(minSponsoredAssetFee),
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.INVOKE_SCRIPT: {
      const { call, fee, initialFee, payment, ...otherProps } = tx;

      return {
        payment: payment.map(p => ({ ...p, amount: new BigNumber(p.amount) })),
        call: call && {
          ...call,
          args: call.args.map(
            function convertArgToBigNumber(
              arg,
            ): InvokeScriptCallArgument<BigNumber> {
              return arg.type === 'integer'
                ? { type: arg.type, value: new BigNumber(arg.value) }
                : arg.type === 'list'
                ? {
                    type: arg.type,
                    value: arg.value.map(
                      convertArgToBigNumber,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ) as unknown as any,
                  }
                : arg;
            },
          ),
        },
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
    case TRANSACTION_TYPE.ALIAS:
    case TRANSACTION_TYPE.SET_SCRIPT:
    case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
    case TRANSACTION_TYPE.UPDATE_ASSET_INFO: {
      const { fee, initialFee, ...otherProps } = tx;

      return {
        fee: new BigNumber(fee),
        ...otherProps,
        sender,
      };
    }
  }
}

export function stringifyTransaction(
  tx: MessageTx,
  { pretty }: { pretty?: boolean } = {},
) {
  return JSONbn.stringify(
    prepareTransactionForJson(tx),
    undefined,
    pretty ? 2 : undefined,
  );
}
