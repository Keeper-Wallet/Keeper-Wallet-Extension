import * as React from 'react';
import BigNumber from '@waves/bignumber';
import { useAppSelector } from 'ui/store';

interface Props {
  id: string;
  tokens: BigNumber;
  className?: string;
}

export function UsdAmount({ id, tokens, className }: Props) {
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const isMainnet = currentNetwork === 'mainnet';

  if (!isMainnet) {
    return null;
  }

  const usdPrices = useAppSelector(state => state.usdPrices);

  return !usdPrices[id] || usdPrices[id] === '1' ? null : (
    <p className={className}>{`≈ $${new BigNumber(usdPrices[id])
      .mul(tokens)
      .toFixed(2)}`}</p>
  );
}
