import { SIGN_TYPE } from '@waves/signature-adapter';

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
  return '';
}

export function isMe(tx: any, type: string) {
  return tx.type === SIGN_TYPE.UPDATE_ASSET_INFO && type === txType;
}
