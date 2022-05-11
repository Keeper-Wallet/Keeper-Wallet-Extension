import { TRANSACTION_TYPE } from '@waves/ts-types';
import { SaTransaction } from 'transactions/utils';

export const messageType = 'create-alias';
export const txType = 'transaction';

export function getAssetsId(tx): Array<string> {
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

export function isMe(tx: SaTransaction, type: string) {
  return tx.type === TRANSACTION_TYPE.ALIAS && type === txType;
}
