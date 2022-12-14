import BigNumber from '@waves/bignumber';
import { usePopupSelector } from 'popup/store/react';

interface Props {
  id: string;
  tokens: BigNumber;
  className?: string;
}

export function UsdAmount({ id, tokens, className }: Props) {
  const usdPrices = usePopupSelector(state => state.usdPrices);

  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const isMainnet = currentNetwork === 'mainnet';

  if (!usdPrices || !isMainnet) {
    return null;
  }

  return !usdPrices[id] || usdPrices[id] === '1' ? null : (
    <p className={className}>{`≈ $${new BigNumber(usdPrices[id])
      .mul(tokens)
      .toFixed(2)}`}</p>
  );
}
