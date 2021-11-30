import { SIGN_TYPE } from '@waves/signature-adapter';

export const messageType = 'burn';
export const txType = 'transaction';

export function getAssetsId(tx): Array<string> {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  const amountAssetId =
    tx.amount && tx.amount.assetId ? tx.amount.assetId : tx.assetId || 'WAVES';

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
    const { coins, tokens, assetId } = tx.amount;

    return { coins, tokens, assetId: tx.assetId || assetId };
  }

  return { coins: tx.amount, assetId: tx.assetId || 'WAVES' };
}

export function getAmountSign() {
  return '-' as const;
}

export function isMe(tx: any, type: string) {
  return tx.type === SIGN_TYPE.BURN && type === txType;
}
