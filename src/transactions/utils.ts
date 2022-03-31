import { base58Encode, stringToBytes } from '@waves/ts-lib-crypto';
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
import BigNumber from '@waves/bignumber';

function processAliasOrAddress(recipient: string, chainId: number) {
  return validators.isValidAddress(recipient)
    ? recipient
    : `alias:${String.fromCharCode(chainId)}:${recipient}`;
}

export const fromSignatureAdapterToNode = {
  transaction: (input, defaultChainId: number) => {
    switch (input.type) {
      case TRANSACTION_TYPE.ISSUE:
        return issue({
          version: input.data.version || 2,
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
        } as any);
      case TRANSACTION_TYPE.TRANSFER: {
        const chainId = input.data.chainId || defaultChainId;

        return transfer({
          version: input.data.version || 2,
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
        } as any);
      }
      case TRANSACTION_TYPE.REISSUE:
        return reissue({
          version: input.data.version || 2,
          senderPublicKey: input.data.senderPublicKey,
          assetId: input.data.assetId,
          quantity: new BigNumber(input.data.quantity),
          reissuable: input.data.reissuable,
          chainId: input.data.chainId || defaultChainId,
          fee: input.data.fee.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
        } as any);
      case TRANSACTION_TYPE.BURN:
        return burn({
          version: input.data.version || 2,
          senderPublicKey: input.data.senderPublicKey,
          assetId: input.data.assetId,
          amount: new BigNumber(input.data.amount || input.data.quantity),
          chainId: input.data.chainId || defaultChainId,
          fee: input.data.fee.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
        } as any);
      case TRANSACTION_TYPE.LEASE: {
        const chainId = input.data.chainId || defaultChainId;

        return lease({
          version: input.data.version || 2,
          senderPublicKey: input.data.senderPublicKey,
          amount: new BigNumber(input.data.amount),
          recipient: processAliasOrAddress(input.data.recipient, chainId),
          fee: input.data.fee.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
          chainId,
        } as any);
      }
      case TRANSACTION_TYPE.CANCEL_LEASE:
        return cancelLease({
          version: input.data.version || 2,
          senderPublicKey: input.data.senderPublicKey,
          leaseId: input.data.leaseId,
          fee: input.data.fee.getCoins(),
          timestamp: input.data.timestamp,
          chainId: input.data.chainId || defaultChainId,
          proofs: input.data.proofs || [],
        } as any);
      case TRANSACTION_TYPE.ALIAS:
        return alias({
          version: input.data.version || 2,
          senderPublicKey: input.data.senderPublicKey,
          alias: input.data.alias,
          fee: input.data.fee.getCoins(),
          timestamp: input.data.timestamp,
          chainId: input.data.chainId || defaultChainId,
          proofs: input.data.proofs || [],
        } as any);
      case TRANSACTION_TYPE.MASS_TRANSFER: {
        const chainId = input.data.chainId || defaultChainId;

        return massTransfer({
          version: input.data.version || 1,
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
        } as any);
      }
      case TRANSACTION_TYPE.DATA:
        return data({
          version: input.data.version || 1,
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
        } as any);
      case TRANSACTION_TYPE.SET_SCRIPT:
        return setScript({
          version: input.data.version || 1,
          senderPublicKey: input.data.senderPublicKey,
          chainId: input.data.chainId || defaultChainId,
          fee: input.data.fee.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
          script: input.data.script || null,
        } as any);
      case TRANSACTION_TYPE.SPONSORSHIP:
        return sponsorship({
          version: input.data.version || 1,
          senderPublicKey: input.data.senderPublicKey,
          minSponsoredAssetFee: input.data.minSponsoredAssetFee.getCoins(),
          assetId: input.data.minSponsoredAssetFee.asset.id,
          fee: input.data.fee.getCoins(),
          timestamp: input.data.timestamp,
          chainId: input.data.chainId || defaultChainId,
          proofs: input.data.proofs || [],
        } as any);
      case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
        return setAssetScript({
          version: input.data.version || 1,
          senderPublicKey: input.data.senderPublicKey,
          assetId: input.data.assetId,
          chainId: input.data.chainId || defaultChainId,
          fee: input.data.fee.getCoins(),
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
          script: input.data.script,
        } as any);
      case TRANSACTION_TYPE.INVOKE_SCRIPT: {
        const chainId = input.data.chainId || defaultChainId;

        return invokeScript({
          version: input.data.version || 1,
          senderPublicKey: input.data.senderPublicKey,
          dApp: processAliasOrAddress(input.data.dApp, chainId),
          call: input.data.call
            ? {
                ...input.data.call,
                args: input.data.call.args.map(arg =>
                  arg.type === 'integer'
                    ? {
                        ...arg,
                        value: new BigNumber(arg.value),
                      }
                    : arg.type === 'list'
                    ? {
                        ...arg,
                        value: arg.value.map(item =>
                          item.type === 'integer'
                            ? { ...item, value: new BigNumber(item.value) }
                            : item
                        ),
                      }
                    : arg
                ),
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
        } as any);
      }
      case TRANSACTION_TYPE.UPDATE_ASSET_INFO:
        return updateAssetInfo({
          version: input.data.version || 1,
          senderPublicKey: input.data.senderPublicKey,
          name: input.data.name,
          description: input.data.description,
          assetId: input.data.assetId,
          fee: input.data.fee.getCoins().toNumber(),
          feeAssetId: input.data.fee.asset.id,
          timestamp: input.data.timestamp,
          proofs: input.data.proofs || [],
          chainId: input.data.chainId || defaultChainId,
        } as any);
      default:
        throw new Error(`Unexpected type: ${input.type}`);
    }
  },
  order: input =>
    order({
      orderType: input.data.orderType,
      version: input.data.version || 3,
      assetPair: {
        amountAsset: input.data.amount.asset.id,
        priceAsset: input.data.price.asset.id,
      },
      price: input.data.price.getCoins(),
      amount: input.data.amount.getCoins(),
      timestamp: input.data.timestamp,
      expiration: input.data.expiration,
      matcherFee: input.data.matcherFee.getCoins(),
      matcherPublicKey: input.data.matcherPublicKey,
      senderPublicKey: input.data.senderPublicKey,
      proofs: input.data.proofs || [],
      matcherFeeAssetId: input.data.matcherFee.asset.id,
    }),
  cancelOrder: input =>
    cancelOrder({
      orderId: input.data.id,
      senderPublicKey: input.data.senderPublicKey,
    }),
};
