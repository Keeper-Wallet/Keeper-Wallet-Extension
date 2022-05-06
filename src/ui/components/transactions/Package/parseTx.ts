import { BigNumber } from '@waves/bignumber';
import { getMoney, IMoneyLike } from '../../../utils/converters';
import { getConfigByTransaction } from '../index';
import { Money } from '@waves/data-entities';

export const messageType = 'transactionPackage';
export const txType = 'transactionPackage';

export function getTransactionData(item) {
  const tx = { type: item.type, ...(item.data ? item.data : item) };
  const config = getConfigByTransaction({ data: item, type: 'transaction' });
  return { tx, config };
}

export function getAssetsId(tx): Array<string> {
  if (!Array.isArray(tx)) {
    return ['WAVES'];
  }

  const assets = tx.reduce((acc, item) => {
    const { tx, config } = getTransactionData(item);
    config.getAssetsId(tx).forEach(item => acc.add(item));
    return acc;
  }, new Set(['WAVES']));

  return Array.from(assets);
}

export function getFee() {
  return { coins: 0, assetId: 'WAVES' };
}

export function getFees(tx, assets) {
  if (!Array.isArray(tx)) {
    return {};
  }

  const fees = tx.reduce((acc, item) => {
    const { tx, config } = getTransactionData(item);
    const fee = config.getFee(tx);
    const accFee = acc[fee.assetId] || {
      coins: 0,
      tokens: 0,
      assetId: fee.assetId,
    };
    accFee.coins = new BigNumber(accFee.coins).add(
      fee.coins || (fee as { amount?: string | number }).amount || 0
    );
    accFee.tokens = new BigNumber(accFee.tokens).add(fee.tokens || 0);
    acc[fee.assetId] = accFee;
    return acc;
  }, Object.create(null));

  return Object.entries(fees).reduce((fees, [assetId, moneyLike]) => {
    fees[assetId] = getMoney(moneyLike as any, assets);
    return fees;
  }, Object.create(null));
}

export function getPackageAmounts(tx = null, assets) {
  if (!Array.isArray(tx)) {
    return [];
  }

  return tx.reduce<Array<{ amount: Money; sign: '-' | '+' | '' }>>(
    (acc, item) => {
      const { tx, config } = getTransactionData(item);

      function addAmount(amount: IMoneyLike | Money) {
        const money = getMoney(amount, assets);
        if (money.getTokens().gt(0)) {
          const sign = config.getAmountSign(tx);
          acc.push({ amount: money, sign });
        }
      }

      if (config.getAmount) {
        addAmount(config.getAmount(tx, item));
      } else {
        config.getAmounts(tx).forEach(addAmount);
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

export function isMe(tx: any, type: string) {
  return type === txType;
}
