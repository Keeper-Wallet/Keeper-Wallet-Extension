export const messageType = 'unknown';
export const txType = null;

export function getAssetsId(tx = null): Array<string> {
  return ['WAVES'];
}

export function getFee(tx = null) {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign(tx = null) {
  return '' as const;
}

export function isMe(tx: any, type: string) {
  return true;
}
