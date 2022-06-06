import { TRANSACTION_TYPE } from '@waves/ts-types';

export const messageType = 'reissue';
export const txType = 'transaction';

export function getAssetsId(tx): Array<string> {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  const amountAssetId =
    tx.quantity && tx.quantity.assetId ? tx.quantity.assetId : tx.assetId;

  if (feeAssetId === amountAssetId) {
    return [amountAssetId];
  }

  return [amountAssetId, feeAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAmount(tx = null) {
  if (tx.quantity) {
    tx.amount = tx.quantity;
  }

  if (typeof tx.amount === 'object') {
    const { amount, coins, tokens, assetId } = tx.amount;

    return { coins: coins ?? amount, tokens, assetId: tx.assetId || assetId };
  }

  return { coins: tx.amount, assetId: tx.assetId || 'WAVES' };
}

export function getAmountSign() {
  return '+' as const;
}

export function isMe(tx, type: string) {
  return tx.type === TRANSACTION_TYPE.REISSUE && type === 'transaction';
}
