import * as React from 'react';
import * as styles from './assetItem.styl';
import { Balance, Loader } from '../../ui';
import { Money } from '@waves/data-entities';
import cn from 'classnames';
import { AssetLogo } from './assetLogo';
import { colors } from './helpers';
import { Trans } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store';
import { favoriteAsset } from '../../../actions';

interface Props {
  balance: Money;
  assetId: string;
  className?: string;
  onClick?: (assetId: string) => void;
}

export function AssetItem({ balance, assetId, className, onClick }: Props) {
  const dispatch = useAppDispatch();
  const assets = useAppSelector(state => state.assets);
  const asset = assets[assetId];

  const displayName = asset?.displayName;
  const isFavorite = asset?.isFavorite;

  return (
    <div className={cn(styles.assetCard, className, 'flex')}>
      <AssetLogo
        assetId={assetId}
        name={displayName}
        hasSponsorship={balance?.asset?.minSponsoredFee.isPositive()}
        hasScript={balance?.asset?.hasScript}
      />

      <div className={cn('body1', styles.assetData)}>
        <div className={cn('basic500', styles.assetName)}>
          {displayName || <Loader />}
        </div>
        <div className={styles.balance}>
          <Balance isShortFormat={false} split={true} balance={balance} />
        </div>
      </div>

      <button
        className={cn(styles.favBtn, 'showTooltip')}
        type="button"
        onClick={() => dispatch(favoriteAsset(assetId))}
      >
        <svg
          className={styles.favIcon}
          fill={isFavorite ? colors.submit400 : 'none'}
          stroke={isFavorite ? colors.submit400 : colors.basic200}
          width="26"
          height="26"
          viewBox="0 0 18 18"
        >
          <path d="M10.6472 6.66036L10.7648 6.9373L11.0645 6.96315L15.2801 7.32666L12.0848 10.0999L11.8574 10.2972L11.9254 10.5904L12.8808 14.7108L9.25837 12.5244L9 12.3685L8.74163 12.5244L5.12113 14.7096L6.08193 10.5911L6.15049 10.2972L5.92239 10.0996L2.72308 7.32803L6.93477 6.97071L7.2352 6.94522L7.35286 6.66761L9.00035 2.78048L10.6472 6.66036Z" />
        </svg>
      </button>
      <div className={cn(styles.favTooltip, 'tooltip')}>
        <Trans
          i18nKey={
            isFavorite
              ? 'assetInfo.favRemoveTooltip'
              : 'assetInfo.favAddTooltip'
          }
        />
      </div>

      <button
        className={cn(styles.infoButton, 'showTooltip')}
        type="button"
        onClick={() => onClick(assetId)}
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
