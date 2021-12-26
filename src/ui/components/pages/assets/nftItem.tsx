import cn from 'classnames';
import * as styles from './nftItem.module.css';
import { AssetLogo } from './assetLogo';
import { Loader } from '../../ui';
import * as React from 'react';
import { Asset } from '@waves/data-entities';
import { Trans } from 'react-i18next';
import { Tooltip } from '../../ui/tooltip';
import { MoreActions } from './moreActions';

interface Props {
  asset: Asset;
  className?: string;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}

export function NftItem({ asset, className, onInfoClick, onSendClick }: Props) {
  const isLoading = !asset.displayName;
  return (
    <div className={cn(styles.nftCard, className, 'flex')}>
      <AssetLogo
        className={cn(styles.nftIcon, isLoading && 'skeleton-glow')}
        assetId={asset.id}
        name={asset.displayName}
        hasScript={asset.hasScript}
        hasSponsorship={!!asset.minSponsoredFee}
      />

      <div className={cn('body1', styles.nftData)}>
        <div className={cn('basic500', styles.nftName)}>
          {!isLoading ? asset.displayName : <Loader />}
        </div>
      </div>

      {!isLoading && (
        <MoreActions>
          <Tooltip content={<Trans i18nKey="assetInfo.infoTooltip" />}>
            {props => (
              <button
                className={styles.infoBtn}
                type="button"
                onClick={() => onInfoClick(asset.id)}
                {...props}
              >
                <svg className={styles.infoIcon} viewBox="0 0 28 26">
                  <path d="M25 13c0 6.075-4.925 11-11 11S3 19.075 3 13 7.925 2 14 2s11 4.925 11 11ZM4 13c0 5.523 4.477 10 10 10s10-4.477 10-10S19.523 3 14 3 4 7.477 4 13Z" />
                  <path d="M14 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a.75.75 0 0 0-.75.75v5.5a.75.75 0 0 0 1.5 0v-5.5A.75.75 0 0 0 14 11Z" />
                </svg>
              </button>
            )}
          </Tooltip>

          <Tooltip content={<Trans i18nKey={'assetInfo.sendAssetTooltip'} />}>
            {props => (
              <button
                className={styles.sendBtn}
                type="button"
                onClick={() => onSendClick(asset.id)}
                {...props}
              >
                <svg
                  className={styles.sendIcon}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.19 7.77178L4.08117 18.8806L5.46862 20.2681L16.5774 9.15923L18.6586 11.2404L19.5743 4.77489L13.1088 5.69061L15.19 7.77178Z" />
                </svg>
              </button>
            )}
          </Tooltip>
        </MoreActions>
      )}
    </div>
  );
}
