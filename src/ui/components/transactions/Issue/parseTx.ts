import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';

export const messageType = 'issue';
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
  return new Money(
    tx.quantity,
    new Asset({
      ...tx,
      precision: Number(tx.precision || tx.decimals) || 0,
    })
  );
}

export function getAmountSign() {
  return '+' as const;
}

export function isMe(tx: any, type: string) {
  return tx.type === TRANSACTION_TYPE.ISSUE && type === txType;
}
