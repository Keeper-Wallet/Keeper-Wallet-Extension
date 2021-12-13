import cn from 'classnames';
import * as styles from './nftItem.module.css';
import { AssetLogo } from './assetLogo';
import { Loader } from '../../ui';
import * as React from 'react';
import { Asset } from '@waves/data-entities';
import { Trans } from 'react-i18next';

interface Props {
  asset: Asset;
  className?: string;
  onInfoClick: (assetId: string) => void;
}

export function NftItem({ asset, className, onInfoClick }: Props) {
  return (
    <div className={cn(styles.nftCard, className, 'flex')}>
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

      <button
        className={cn(styles.infoButton, 'showTooltip')}
        type="button"
        onClick={() => onInfoClick(asset.id)}
      >
        <svg className={styles.infoIcon} viewBox="0 0 28 26">
          <path d="M25 13c0 6.075-4.925 11-11 11S3 19.075 3 13 7.925 2 14 2s11 4.925 11 11ZM4 13c0 5.523 4.477 10 10 10s10-4.477 10-10S19.523 3 14 3 4 7.477 4 13Z" />
          <path d="M14 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a.75.75 0 0 0-.75.75v5.5a.75.75 0 0 0 1.5 0v-5.5A.75.75 0 0 0 14 11Z" />
        </svg>
      </button>
      <div className={cn(styles.infoTooltip, 'tooltip')}>
        <Trans i18nKey="assetInfo.infoTooltip" />
      </div>
    </div>
  );
}
