import { SIGN_TYPE } from '@waves/signature-adapter';

export const messageType = 'set-asset-script';
export const txType = 'transaction';

export function getAssetsId(tx): Array<string> {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  return [feeAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAmount() {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '';
}

export function isMe(tx: any, type: string) {
  return tx.type === SIGN_TYPE.SET_ASSET_SCRIPT && type === txType;
}
