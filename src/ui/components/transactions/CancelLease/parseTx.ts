import { SIGN_TYPE } from '@waves/signature-adapter';

export const messageType = 'cancel-leasing';
export const txType = 'transaction';

export function getAssetsId(tx): Array<string> {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  const amountAssetId = 'WAVES';

  if (feeAssetId === amountAssetId) {
    return [amountAssetId];
  }

  return [amountAssetId, feeAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAmount(tx = null, message) {
  if (!message || !message.lease) {
    return { coins: null, assetId: 'WAVES' };
  }

  return { coins: message.lease.amount, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '+' as const;
}

export function isMe(tx: any, type: string) {
  return tx.type === SIGN_TYPE.CANCEL_LEASING && type === 'transaction';
}
