import * as React from 'react';
import * as styles from '../../wallets/wallet.styl';
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
      className={cn(styles.wallet, className, styles.inner, 'flex')}
      onClick={() => onClick(assetId)}
    >
      <AssetLogo assetId={assetId} name={displayName} />

      <div className={cn('body1', styles.accountData)}>
        <div className={cn('basic500', styles.accountName)}>
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
