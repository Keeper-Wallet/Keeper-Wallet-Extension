export const messageType = 'matcher_orders';
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

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === 1001 && type === txType;
}
