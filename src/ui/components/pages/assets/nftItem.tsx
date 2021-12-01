import cn from 'classnames';
import * as styles from './nftItem.styl';
import { AssetLogo } from './assetLogo';
import { Loader } from '../../ui';
import * as React from 'react';
import { Asset } from '@waves/data-entities';

interface Props {
  asset: Asset;
  className?: string;
  onClick: (assetId: string) => void;
}

export function NftItem({ asset, className, onClick }: Props) {
  return (
    <div
      className={cn(styles.nftCard, className, 'flex')}
      onClick={() => onClick(asset.id)}
    >
      <AssetLogo
        assetId={asset.id}
        name={asset.displayName}
        hasScript={asset.hasScript}
        hasSponsorship={!!asset.minSponsoredFee}
      />

      <div className={cn('body1', styles.nftData)}>
        <div className={cn('basic500', styles.nftName)}>
          {asset.displayName || <Loader />}
        </div>
      </div>
    </div>
  );
}
