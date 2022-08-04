import { IMoneyLike } from 'ui/utils/converters';

export function getFee(tx: { fee?: IMoneyLike | string }) {
  return typeof tx.fee === 'object'
    ? tx.fee
    : { coins: tx.fee, assetId: 'WAVES' };
}
