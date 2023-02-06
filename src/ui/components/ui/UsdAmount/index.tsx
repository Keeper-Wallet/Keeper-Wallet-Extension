import BigNumber from '@waves/bignumber';
import { usePopupSelector } from 'popup/store/react';
import { useMemo } from 'react';

import { useUsdPrices } from '../../../../_core/usdPrices';
import { Loader } from '../loader';

interface Props {
  id: string;
  tokens: BigNumber;
  className?: string;
}

export function UsdAmount({ id, tokens, className }: Props) {
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const isMainnet = currentNetwork === 'mainnet';

  const usdPrices = useUsdPrices(useMemo(() => [id], [id]));

  if (!isMainnet) {
    return null;
  }

  if (usdPrices[id] == null) {
    return <Loader />;
  }

  return (
    <p className={className}>
      ≈ ${new BigNumber(usdPrices[id]).mul(tokens).toFixed(2)}
    </p>
  );
}
