import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';

interface Props {
  asset?: AssetDetail;
  amount: number;
  className?: string;
}

export function UsdAmount({ asset, amount, className }: Props) {
  if (!asset?.usdPrice || asset.usdPrice === '1') {
    return null;
  }

  return (
    <p className={className}>{`≈ $${
      Math.ceil(+asset.usdPrice * amount * 100) / 100
    }`}</p>
  );
}
