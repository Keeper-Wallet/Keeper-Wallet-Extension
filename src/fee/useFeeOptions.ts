import { type Money } from '@waves/data-entities';
import { type MessageTx } from 'messages/types';
import { usePopupSelector } from 'popup/store/react';

import { getFeeOptions } from './utils';

export function useFeeOptions({
  initialFee,
  txType,
}: {
  initialFee: Money;
  txType: MessageTx['type'];
}) {
  const assets = usePopupSelector(state => state.assets);

  const balance = usePopupSelector(
    state =>
      state.selectedAccount && state.balances[state.selectedAccount.address],
  );

  const usdPrices = usePopupSelector(state => state.usdPrices);

  return getFeeOptions({
    assets,
    balance,
    initialFee,
    txType,
    usdPrices,
  });
}
