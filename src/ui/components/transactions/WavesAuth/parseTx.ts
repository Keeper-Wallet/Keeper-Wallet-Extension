export const messageType = 'wavesAuth';
export const txType = 'request';

export function getAssetsId(): Array<string> {
  return ['WAVES'];
}

export function getFee() {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmount() {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '' as const;
}

export function isMe(tx: any, type: string) {
  return type === messageType;
}
