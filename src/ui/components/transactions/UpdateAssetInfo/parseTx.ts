import { TRANSACTION_TYPE } from '@waves/ts-types';

export const messageType = 'updateAssetInfo';
export const txType = 'transaction';

export function getAssetsId(tx): Array<string> {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  return [feeAssetId];
}

export function getFee(tx) {
  return typeof tx.fee === 'object'
    ? tx.fee
    : { coins: tx.fee, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '' as const;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMe(tx: any, type: string) {
  return tx.type === TRANSACTION_TYPE.UPDATE_ASSET_INFO && type === txType;
}
