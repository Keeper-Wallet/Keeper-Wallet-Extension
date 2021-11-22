import * as React from 'react';
import * as styles from './assetItem.styl';
import { Balance, Loader } from '../../ui';
import { Money } from '@waves/data-entities';
import cn from 'classnames';
import { AssetLogo } from './assetLogo';

interface Props {
  balance: Money;
  assetId: string;
  className?: string;
  onClick?: (assetId: string) => void;
}

export function AssetItem({ balance, assetId, className, onClick }: Props) {
  const displayName = balance && balance.asset.displayName;

  return (
    <div
      className={cn(styles.assetCard, className, 'flex')}
      onClick={() => onClick(assetId)}
    >
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
          <Balance
            isShortFormat={false}
            split={true}
            balance={balance}
            assetId={assetId}
          />
        </div>
      </div>
    </div>
  );
}
