export function getFee(tx) {
  return typeof tx.fee === 'object'
    ? tx.fee
    : { coins: tx.fee, assetId: 'WAVES' };
}
