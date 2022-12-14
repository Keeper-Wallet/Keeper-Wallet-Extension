import { Money } from '@waves/data-entities';
import { usePopupSelector } from 'popup/store/react';

import { getFeeOptions } from './utils';

export function useFeeOptions({
  initialFee,
  txType,
}: {
  initialFee: Money;
  txType: number;
}) {
  const assets = usePopupSelector(state => state.assets);

  const balance = usePopupSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    state => state.balances[state.selectedAccount?.address!]
  );

  const feeConfig = usePopupSelector(state => state.feeConfig);
  const usdPrices = usePopupSelector(state => state.usdPrices);

  return getFeeOptions({
    assets,
    balance,
    feeConfig,
    initialFee,
    txType,
    usdPrices,
  });
}
