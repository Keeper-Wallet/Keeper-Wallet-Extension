import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';

interface Props {
  asset?: AssetDetail;
  amount: number;
  addSign?: string;
  className?: string;
}

export const UsdAmount = ({ asset, amount, addSign, className }: Props) =>
  +asset?.usdPrice ? (
    <p className={className}>
      {addSign ? <span>{addSign}</span> : null}
      <span>{`$${(+asset.usdPrice * amount).toFixed(2)}`}</span>
    </p>
  ) : null;
