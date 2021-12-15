import cn from 'classnames';
import * as styles from './nftItem.module.css';
import { AssetLogo } from './assetLogo';
import { Loader } from '../../ui';
import * as React from 'react';
import { Asset } from '@waves/data-entities';
import { Trans } from 'react-i18next';
import { Tooltip } from '../../ui/tooltip';

interface Props {
  asset: Asset;
  className?: string;
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}

export function NftItem({ asset, className, onInfoClick, onSendClick }: Props) {
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

      {asset && (
        <div className={styles.moreBtn}>
          <svg
            className={styles.moreIcon}
            width="14"
            height="14"
            viewBox="-3 -3 20 20"
            fill="none"
          >
            <path d="M7.00004 4.66665C7.64171 4.66665 8.16671 4.14165 8.16671 3.49998C8.16671 2.85831 7.64171 2.33331 7.00004 2.33331C6.35837 2.33331 5.83337 2.85831 5.83337 3.49998C5.83337 4.14165 6.35837 4.66665 7.00004 4.66665ZM7.00004 5.83331C6.35837 5.83331 5.83337 6.35831 5.83337 6.99998C5.83337 7.64165 6.35837 8.16665 7.00004 8.16665C7.64171 8.16665 8.16671 7.64165 8.16671 6.99998C8.16671 6.35831 7.64171 5.83331 7.00004 5.83331ZM7.00004 9.33331C6.35837 9.33331 5.83337 9.85831 5.83337 10.5C5.83337 11.1416 6.35837 11.6666 7.00004 11.6666C7.64171 11.6666 8.16671 11.1416 8.16671 10.5C8.16671 9.85831 7.64171 9.33331 7.00004 9.33331Z" />
          </svg>

          <div className={styles.actions}>
            <div className={styles.actionsOverlay} />

            <Tooltip content={<Trans i18nKey={'assetInfo.sendAssetTooltip'} />}>
              <button
                className={styles.sendBtn}
                type="button"
                onClick={() => onSendClick(asset.id)}
              >
                <svg
                  className={styles.sendIcon}
                  width="26"
                  height="26"
                  viewBox="0 0 18 18"
                >
                  <path d="M11.5 4.5L10.6125 5.3875L9.61875 4.39375V11.375H8.38125V4.39375L7.3875 5.3875L6.5 4.5L9 2L11.5 4.5ZM14 7.625V14.5C14 15.1875 13.4375 15.75 12.75 15.75H5.25C4.55625 15.75 4 15.1875 4 14.5V7.625C4 6.93125 4.55625 6.375 5.25 6.375H7.125V7.625H5.25V14.5H12.75V7.625H10.875V6.375H12.75C13.4375 6.375 14 6.93125 14 7.625Z" />
                </svg>
              </button>
            </Tooltip>

            <Tooltip content={<Trans i18nKey="assetInfo.infoTooltip" />}>
              <button
                className={styles.infoButton}
                type="button"
                onClick={() => onInfoClick(asset.id)}
              >
                <svg className={styles.infoIcon} viewBox="0 0 28 26">
                  <path d="M25 13c0 6.075-4.925 11-11 11S3 19.075 3 13 7.925 2 14 2s11 4.925 11 11ZM4 13c0 5.523 4.477 10 10 10s10-4.477 10-10S19.523 3 14 3 4 7.477 4 13Z" />
                  <path d="M14 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a.75.75 0 0 0-.75.75v5.5a.75.75 0 0 0 1.5 0v-5.5A.75.75 0 0 0 14 11Z" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
