import { AssetsRecord } from 'assets/types';
import { getMoney, IMoneyLike } from '../../../utils/converters';

export const messageType = 'create-order';
export const txType = 'order';

export function getAssetsId(tx: {
  amount?: { assetId?: string };
  amountAssetId?: string;
  feeAssetId?: string;
  matcherFee?: { assetId?: string };
  price?: { assetId?: string };
  priceAssetId?: string;
}) {
  const assets: Record<string, null> = {};
  const feeAssetId =
    tx.matcherFee && tx.matcherFee.assetId
      ? tx.matcherFee.assetId
      : tx.feeAssetId || 'WAVES';
  const amountAssetId =
    tx.amount && tx.amount.assetId
      ? tx.amount.assetId
      : tx.amountAssetId || 'WAVES';
  const priceAssetId =
    tx.price && tx.price.assetId
      ? tx.price.assetId
      : tx.priceAssetId || 'WAVES';

  assets[feeAssetId] = null;
  assets[amountAssetId] = null;
  assets[priceAssetId] = null;

  return Object.keys(assets);
}

export function getFee(tx: { matcherFee?: IMoneyLike | string }) {
  return typeof tx.matcherFee === 'object'
    ? tx.matcherFee
    : { coins: tx.matcherFee, assetId: 'WAVES' };
}

export function getAmount(tx: { amount?: IMoneyLike | string | number }) {
  return typeof tx.amount === 'object'
    ? tx.amount
    : { coins: tx.amount, assetId: 'WAVES' };
}

export function getAmountSign(tx: { orderType?: unknown }) {
  return tx.orderType === 'sell' ? '-' : '+';
}

export function getPrice(tx: { price?: IMoneyLike | string | number }) {
  return typeof tx.price === 'object'
    ? tx.price
    : { coins: tx.price, assetId: 'WAVES' };
}

export function getPriceSign(tx: { orderType?: string }) {
  return tx.orderType === 'buy' ? '-' : '+';
}

export function getPriceAmount(
  tx: {
    amount?: IMoneyLike | string | number;
    price?: IMoneyLike | string | number;
  },
  assets: AssetsRecord
) {
  const amount = getMoney(getAmount(tx), assets);
  const price = getMoney(getPrice(tx), assets);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return amount!.convertTo(price!.asset, price!.getTokens());
}

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === 1002 && type === txType;
}
