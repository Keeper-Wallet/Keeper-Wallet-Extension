export const messageType = 'wavesAuth';
export const txType = 'request';

export function getAssetsId(tx = null): Array<string> {
  return ['WAVES'];
}

export function getFee(tx = null) {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '';
}

export function isMe(tx: any, type: string) {
  return type === messageType;
}
