export const messageType = 'customData';
export const txType = messageType;

export function getAssetsId(): string[] {
  return [];
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

export function isMe(tx: unknown, type: string | null) {
  return type === txType;
}
