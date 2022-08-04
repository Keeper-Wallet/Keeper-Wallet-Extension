import { TRANSACTION_TYPE } from '@waves/ts-types';
import { IMoneyLike } from 'ui/utils/converters';

export const messageType = 'updateAssetInfo';
export const txType = 'transaction';

export function getAssetsId(tx: {
  fee?: { assetId?: string };
  feeAssetId?: string;
}) {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  return [feeAssetId];
}

export function getFee(tx: { fee?: IMoneyLike | string }) {
  return typeof tx.fee === 'object'
    ? tx.fee
    : { coins: tx.fee, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '' as const;
}

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.UPDATE_ASSET_INFO && type === txType;
}
