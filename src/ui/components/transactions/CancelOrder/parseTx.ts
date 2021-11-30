import { SIGN_TYPE } from '@waves/signature-adapter';

export const messageType = 'cancel-order';
export const txType = 'cancelOrder';

export function getAssetsId(tx): Array<string> {
  return ['WAVES'];
}

export function getFee(tx) {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '' as const;
}

export function isMe(tx: any, type: string) {
  return (
    tx.type === SIGN_TYPE.CANCEL_ORDER &&
    (type === txType || type === 'request')
  );
}
