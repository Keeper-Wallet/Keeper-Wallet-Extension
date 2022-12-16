import { BigNumber } from '@waves/bignumber';
import { Money } from '@waves/data-entities';
import { AssetsRecord } from 'assets/types';

import { getMoney, IMoneyLike } from '../../../utils/converters';
import { getConfigByTransaction } from '../index';

export const messageType = 'transactionPackage';
export const txType = 'transactionPackage';

export interface PackageItem {
  type: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export function getTransactionData(item: PackageItem) {
  const tx = { type: item.type, ...(item.data ? item.data : item) };
  const config = getConfigByTransaction({ data: item, type: 'transaction' });
  return { tx, config };
}

export function getAssetsId(tx: PackageItem[]): string[] {
  if (!Array.isArray(tx)) {
    return ['WAVES'];
  }

  const assets = tx.reduce((acc, item) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { tx, config } = getTransactionData(item);
    // eslint-disable-next-line @typescript-eslint/no-shadow
    config.getAssetsId(tx).forEach(item => acc.add(item));
    return acc;
  }, new Set(['WAVES']));

  return Array.from(assets);
}

export function getFee() {
  return { coins: 0, assetId: 'WAVES' };
}

type AnyMoney = IMoneyLike | BigNumber | Money | string | number;

export function getFees(tx: PackageItem[], assets: AssetsRecord) {
  if (!Array.isArray(tx)) {
    return {};
  }

  const fees = tx.reduce((acc, item) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { tx, config } = getTransactionData(item);
    const fee = config.getFee(tx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accFee = acc[fee.assetId as any] || {
      coins: 0,
      tokens: 0,
      assetId: fee.assetId,
    };
    accFee.coins = new BigNumber(accFee.coins).add(
      fee.coins || (fee as { amount?: string | number }).amount || 0
    );
    accFee.tokens = new BigNumber(accFee.tokens).add(fee.tokens || 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acc[fee.assetId as any] = accFee;
    return acc;
  }, Object.create(null));

  // eslint-disable-next-line @typescript-eslint/no-shadow
  return Object.entries(fees).reduce((fees, [assetId, moneyLike]) => {
    fees[assetId] = getMoney(moneyLike as AnyMoney, assets);
    return fees;
  }, Object.create(null));
}

export function getPackageAmounts(tx: PackageItem[], assets: AssetsRecord) {
  if (!Array.isArray(tx)) {
    return [];
  }

  return tx.reduce<Array<{ amount: Money; sign: '-' | '+' | '' }>>(
    (acc, item) => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { tx, config } = getTransactionData(item);

      function addAmount(amount: IMoneyLike | Money) {
        const money = getMoney(amount, assets);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (money!.getTokens().gt(0)) {
          const sign = config.getAmountSign(tx);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          acc.push({ amount: money!, sign });
        }
      }

      if (config.getAmount) {
        addAmount(config.getAmount(tx, item));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        config.getAmounts!(tx).forEach(addAmount);
      }

      return acc;
    },
    []
  );
}

export function getAmount() {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '' as const;
}

export function isMe(_tx: unknown, type: string | null) {
  return type === txType;
}
