import { TRANSACTION_TYPE } from '@waves/ts-types';
import { IMoneyLike } from 'ui/utils/converters';

export const messageType = 'lease';
export const txType = 'transaction';

export function getAssetsId(tx: {
  amount?: { assetId?: string };
  assetId?: string;
  fee?: { assetId?: string };
  feeAssetId?: string;
}): string[] {
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

export function getAmount(tx: { amount?: string | IMoneyLike }): IMoneyLike {
  return typeof tx.amount === 'object'
    ? tx.amount
    : { coins: tx.amount, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '-' as const;
}

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.LEASE && type === txType;
}
