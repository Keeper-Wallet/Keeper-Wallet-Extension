import { TRANSACTION_TYPE } from '@waves/ts-types';

export const messageType = 'script_invocation';
export const txType = 'transaction';

export function getAssetsId(tx): Array<string> {
  return [tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES'];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAmount(tx = null) {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '' as const;
}

export function isMe(tx: any, type: string) {
  return tx.type === TRANSACTION_TYPE.INVOKE_EXPRESSION && type === txType;
}
