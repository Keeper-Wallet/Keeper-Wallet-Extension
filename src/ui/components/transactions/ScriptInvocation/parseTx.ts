import { BigNumber } from '@waves/bignumber';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { IMoneyLike } from 'ui/utils/converters';

export const messageType = 'script_invocation';
export const txType = 'transaction';

export function getTransferAmount(
  amount: { assetId?: string } | string,
  assetId: string
) {
  if (typeof amount === 'object') {
    amount.assetId = assetId;
    return amount;
  }

  return { coins: amount, assetId };
}

export function getAssetsId(tx: {
  fee?: { assetId?: string };
  feeAssetId?: string;
  payment?: Array<{ assetId?: string } | string | number | null>;
}): string[] {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  const amountAssetId = (tx.payment || []).map(item => {
    switch (typeof item) {
      case 'string':
        return 'WAVES';
      case 'number':
        return 'WAVES';
      case 'object':
        return item && item.assetId ? item.assetId : 'WAVES';
    }
  });

  return [...amountAssetId, feeAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAmounts(tx: { payment?: IMoneyLike[] }) {
  const amounts: IMoneyLike[] = [];

  (tx.payment || []).forEach(item => {
    let tokens = new BigNumber(0);
    let coins = new BigNumber(0);
    if (item && item.tokens) {
      tokens = tokens.add(item.tokens);
    } else if (item && item.coins) {
      coins = coins.add(item.coins);
    } else if (item && item.amount) {
      coins = coins.add(item.amount);
    } else {
      const parse = new BigNumber(item as unknown as string);
      if (!parse.isNaN()) {
        coins = coins.add(parse);
      }
    }
    const assetId = item.assetId || 'WAVES';

    amounts.push({ coins, tokens, assetId });
  });

  return amounts;
}

export function getAmountSign() {
  return '-' as const;
}

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.INVOKE_SCRIPT && type === txType;
}
