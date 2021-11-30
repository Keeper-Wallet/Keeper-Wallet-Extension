import { SIGN_TYPE } from '@waves/signature-adapter';

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
  return typeof tx.quantity === 'object'
    ? tx.quantity
    : { coins: tx.quantity, assetId: tx.assetId };
}

export function getAmountSign() {
  return '+' as const;
}

export function isMe(tx: any, type: string) {
  return tx.type === SIGN_TYPE.REISSUE && type === 'transaction';
}
