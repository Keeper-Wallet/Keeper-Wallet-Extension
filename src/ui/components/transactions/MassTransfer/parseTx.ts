import { BigNumber } from '@waves/bignumber';
import { TRANSACTION_TYPE } from '@waves/ts-types';

export const messageType = 'mass_transfer';
export const txType = 'transaction';

export function getTransferAmount(amount, assetId) {
  if (typeof amount === 'object') {
    amount.assetId = assetId;
    return amount;
  }

  return { coins: amount, assetId };
}

export function getAssetsId(tx): Array<string> {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  const amountAssetId =
    tx.totalAmount && tx.totalAmount.assetId
      ? tx.totalAmount.assetId
      : tx.assetId || 'WAVES';

  if (feeAssetId === amountAssetId) {
    return [amountAssetId];
  }

  return [amountAssetId, feeAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAmount(tx) {
  const assetId =
    tx.totalAmount && tx.totalAmount.assetId
      ? tx.totalAmount.assetId
      : tx.assetId || 'WAVES';
  let tokens = new BigNumber(0);
  let coins = new BigNumber(0);

  (tx.transfers || []).forEach(({ amount }) => {
    if (amount && amount.tokens) {
      tokens = tokens.add(amount.tokens);
    } else if (amount && amount.coins) {
      coins = coins.add(amount.coins);
    } else {
      const parse = new BigNumber(amount);
      if (!parse.isNaN()) {
        coins = coins.add(parse);
      }
    }
  });

  return { coins, tokens, assetId };
}

export function getAmountSign() {
  return '-' as const;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMe(tx: any, type: string) {
  return tx.type === TRANSACTION_TYPE.MASS_TRANSFER && type === txType;
}
