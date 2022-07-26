import { TRANSACTION_TYPE } from '@waves/ts-types';
import { IMoneyLike } from 'ui/utils/converters';

export const messageType = 'reissue';
export const txType = 'transaction';

export function getAssetsId(tx: {
  assetId?: string;
  fee?: { assetId?: string };
  feeAssetId?: string;
  quantity?: { assetId?: string };
}): Array<string> {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  const amountAssetId =
    tx.quantity && tx.quantity.assetId ? tx.quantity.assetId : tx.assetId;

  if (feeAssetId === amountAssetId) {
    return [amountAssetId];
  }

  return [amountAssetId as string, feeAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAmount(tx: {
  amount?: IMoneyLike | string;
  assetId: string;
  quantity?: IMoneyLike | string;
}) {
  const quantity = tx.quantity || tx.amount;

  if (typeof quantity === 'object') {
    const { amount, coins, tokens, assetId } = quantity;

    return { coins: coins ?? amount, tokens, assetId: tx.assetId || assetId };
  }

  return { coins: quantity, assetId: tx.assetId };
}

export function getAmountSign() {
  return '+' as const;
}

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.REISSUE && type === 'transaction';
}
