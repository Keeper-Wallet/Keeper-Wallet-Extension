import { TRANSACTION_TYPE } from '@waves/ts-types';

export const messageType = 'set-asset-script';
export const txType = 'transaction';

export function getAssetsId(tx: {
  fee?: { assetId?: string };
  feeAssetId?: string;
}) {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  return [feeAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAmount() {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '' as const;
}

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.SET_ASSET_SCRIPT && type === txType;
}
