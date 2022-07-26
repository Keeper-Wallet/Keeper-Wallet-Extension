import { TRANSACTION_TYPE } from '@waves/ts-types';

export const messageType = 'cancel-leasing';
export const txType = 'transaction';

export function getAssetsId(tx: {
  fee?: { assetId?: string };
  feeAssetId?: string;
}) {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  const amountAssetId = 'WAVES';

  if (feeAssetId === amountAssetId) {
    return [amountAssetId];
  }

  return [amountAssetId, feeAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAmount(tx?: { lease?: { amount: string } }) {
  if (!tx?.lease) {
    return { coins: null, assetId: 'WAVES' };
  }

  return { coins: tx.lease.amount, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '+' as const;
}

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.CANCEL_LEASE && type === 'transaction';
}
