export const messageType = 'cancel-order';
export const txType = 'cancelOrder';

export function getAssetsId(): string[] {
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
  return tx.type === 1003 && (type === txType || type === 'request');
}
