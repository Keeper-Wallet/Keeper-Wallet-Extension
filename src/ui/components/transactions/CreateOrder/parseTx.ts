import { getMoney } from '../../../utils/converters';

export const messageType = 'create-order';
export const txType = 'order';

export function getAssetsId(tx): Array<string> {
  const assets = {};
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

export function getFee(tx) {
  return typeof tx.matcherFee === 'object'
    ? tx.matcherFee
    : { coins: tx.matcherFee, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
  return typeof tx.amount === 'object'
    ? tx.amount
    : { coins: tx.amount, assetId: 'WAVES' };
}

export function getAmountSign(tx) {
  return tx.orderType === 'sell' ? '-' : '+';
}

export function getPrice(tx = null) {
  return typeof tx.price === 'object'
    ? tx.price
    : { coins: tx.price, assetId: 'WAVES' };
}

export function getPriceSign(tx) {
  return tx.orderType === 'buy' ? '-' : '+';
}

export function getPriceAmount(tx, assets) {
  const amount = getMoney(getAmount(tx), assets);
  const price = getMoney(getPrice(tx), assets);
  return amount.convertTo(price.asset, price.getTokens());
}

export function isMe(tx: any, type: string) {
  return tx.type === 1002 && type === txType;
}
