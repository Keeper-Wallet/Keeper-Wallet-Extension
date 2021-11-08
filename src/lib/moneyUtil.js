import { Money } from '@waves/data-entities';

export function moneylikeToMoney(moneylike, asset) {
  return new Money(moneylike.value, asset);
}

export function moneyToMoneylike(money) {
  return {
    assetId: money.asset.id,
    value: money.getCoins().toString(),
  };
}
