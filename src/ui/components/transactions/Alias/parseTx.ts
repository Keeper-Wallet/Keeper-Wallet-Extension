import { TRANSACTION_TYPE } from '@waves/ts-types';

export const messageType = 'create-alias';
export const txType = 'transaction';

export function getAssetsId(tx: { fee?: { assetId?: string } }) {
  const feeAssetId = tx.fee && tx.fee.assetId ? tx.fee.assetId : 'WAVES';
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
  return tx.type === TRANSACTION_TYPE.ALIAS && type === txType;
}
