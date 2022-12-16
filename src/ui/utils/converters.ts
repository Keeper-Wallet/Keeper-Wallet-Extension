import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { AssetsRecord } from 'assets/types';

export const moneyLikeToMoney = (amount: IMoneyLike, assets: AssetsRecord) => {
  if (amount) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let amountResult = new Money(0, assets[amount.assetId || 'WAVES'] as any);

    if ('tokens' in amount) {
      amountResult = amountResult.cloneWithTokens(amount.tokens || 0);
    }

    if ('coins' in amount) {
      amountResult = amountResult.add(
        amountResult.cloneWithCoins(amount.coins || 0)
      );
    }

    return amountResult;
  }
};

export const getMoney = (
  amount: IMoneyLike | BigNumber | Money | string | number,
  assets: AssetsRecord
) => {
  if (amount instanceof Money) {
    return amount;
  }

  if (amount instanceof BigNumber) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Money(amount, assets.WAVES as any);
  }

  if (typeof amount === 'object') {
    if (amount.tokens != null || amount.coins != null) {
      return moneyLikeToMoney(amount, assets);
    }

    return new Money(
      (amount as { amount?: number | string }).amount || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assets[amount.assetId || 'WAVES'] as any
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Money(new BigNumber(amount), assets.WAVES as any);
};

export interface IMoneyLike {
  amount?: number | string | BigNumber;
  coins?: number | string | BigNumber | null;
  tokens?: number | string | BigNumber;
  assetId: string | null;
}
