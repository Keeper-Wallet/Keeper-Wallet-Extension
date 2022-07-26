import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { AssetDetail } from 'assets/types';

export const messageType = 'issue';
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

export function getAmount(
  tx: AssetDetail & { decimals?: number; quantity: string }
) {
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

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.ISSUE && type === txType;
}
