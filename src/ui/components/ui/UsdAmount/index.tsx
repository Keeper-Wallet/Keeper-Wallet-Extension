import * as React from 'react';
import BigNumber from '@waves/bignumber';
import { useAppSelector } from 'ui/store';
import { AssetDetail } from 'ui/services/Background';

interface Props {
  asset?: AssetDetail;
  tokens: BigNumber;
  className?: string;
}

export function UsdAmount({ asset, tokens, className }: Props) {
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const isMainnet = currentNetwork === 'mainnet';

  if (!isMainnet || !asset?.usdPrice || asset.usdPrice === '1') {
    return null;
  }

  return (
    <p className={className}>{`≈ $${new BigNumber(asset.usdPrice)
      .mul(tokens)
      .toFixed(2)}`}</p>
  );
}
