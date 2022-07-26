import { BigNumber } from '@waves/bignumber';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { IMoneyLike } from 'ui/utils/converters';

export const messageType = 'mass_transfer';
export const txType = 'transaction';

export function getTransferAmount(
  amount: IMoneyLike | string,
  assetId: string
) {
  if (typeof amount === 'object') {
    amount.assetId = assetId;
    return amount;
  }

  return { coins: amount, assetId };
}

export function getAssetsId(tx: {
  assetId?: string;
  fee?: { assetId?: string };
  feeAssetId?: string;
  totalAmount?: { assetId?: string };
}): Array<string> {
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

export function getAmount(tx: {
  assetId?: string;
  totalAmount?: { assetId?: string };
  transfers?: Array<{ amount?: { coins?: string; tokens?: string } }>;
}) {
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
      const parse = new BigNumber(amount as string);
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

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.MASS_TRANSFER && type === txType;
}
