import { type Money } from '@waves/data-entities';
import { type MessageTx } from 'messages/types';
import { usePopupSelector } from 'popup/store/react';
import { getAccountAddress } from 'ui/utils/getActiveAccount';

import { getFeeOptions } from './utils';

export function useFeeOptions({
  initialFee,
  txType,
}: {
  initialFee: Money;
  txType: MessageTx['type'];
}) {
  const assets = usePopupSelector(state => state.assets);

  const accountBalance = usePopupSelector(state =>
    state.selectedAccount && state.balances[getAccountAddress(state.selectedAccount)],
  );

  const usdPrices = usePopupSelector(state => state.usdPrices);

  return getFeeOptions({
    assets,
    balance: accountBalance,
    initialFee,
    txType,
    usdPrices,
  });
}
