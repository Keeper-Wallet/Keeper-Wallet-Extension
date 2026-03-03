import BigNumber from '@waves/bignumber';
import { usePopupSelector } from 'popup/store/react';
import { useMemo } from 'react';

import { useUnit0UsdPrices, useUsdPrices } from '../../../../_core/usdPrices';
import { Loader } from '../loader';

interface Props {
  id: string;
  tokens: BigNumber;
  className?: string;
}

export function UsdAmount({ id, tokens, className }: Props) {
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const isMainnet = currentNetwork === 'mainnet';

  // Determine token type
  const isUnit0Token = id === 'unit0' || id.startsWith('0x');

  // Fetch prices from appropriate provider
  const wavesUsdPrices = useUsdPrices(
    useMemo(() => (isUnit0Token ? [] : [id]), [id, isUnit0Token]),
  );
  const unit0UsdPrices = useUnit0UsdPrices(
    useMemo(() => (isUnit0Token ? [id] : []), [id, isUnit0Token]),
  );

  if (!isMainnet) {
    return null;
  }

  // Get price from appropriate source
  const usdPrice = isUnit0Token
    ? Object.values(unit0UsdPrices)[0]
    : wavesUsdPrices[id];

  return usdPrice == null ? (
    <Loader />
  ) : (
    <p className={className}>
      ≈ ${new BigNumber(usdPrice).mul(tokens).abs().toFixed(2)}
    </p>
  );
}
