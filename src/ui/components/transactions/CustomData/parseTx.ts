export const messageType = 'customData';
export const txType = messageType;

export function getAssetsId(tx?): Array<string> {
  return [];
}

export function getFee(tx?) {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '' as const;
}

export function isMe(tx: any, type: string) {
  return type === txType;
}
