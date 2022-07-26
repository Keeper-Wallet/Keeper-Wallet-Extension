import { TRANSACTION_TYPE } from '@waves/ts-types';
import { IMoneyLike } from 'ui/utils/converters';

export const messageType = 'burn';
export const txType = 'transaction';

export function getAssetsId(tx: {
  amount?: { assetId?: string };
  assetId?: string;
  fee?: { assetId?: string };
  feeAssetId?: string;
}): Array<string> {
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

export function getAmount(tx: {
  amount?: IMoneyLike | string;
  assetId?: string;
  quantity?: IMoneyLike | string;
}) {
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
  return '-' as const;
}

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.BURN && type === txType;
}
