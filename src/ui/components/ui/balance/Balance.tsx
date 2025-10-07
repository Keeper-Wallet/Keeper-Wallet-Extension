import { type Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import clsx from 'clsx';

import { Loader } from '../loader';
import { UsdAmount } from '../UsdAmount';
import * as styles from './Balance.module.css';

/**
 * Formats balance display to limit Unit0 tokens to 8 decimal places (same as Waves)
 * while keeping the correct 18-decimal precision for calculations
 */
function formatBalanceDisplay(balance: Money, isShortFormat?: boolean): string {
  // For Unit0 tokens (18 decimals), limit display to 8 decimals like Waves
  if (balance.asset.id === 'unit0' || balance.asset.precision === 18) {
    const maxDisplayDecimals = 8;
    const tokens = balance.getTokens();
    return tokens.toFormat(maxDisplayDecimals, BigNumber.ROUND_MODE.ROUND_DOWN);
  }
  
  // For all other assets, use default formatting
  return isShortFormat ? balance.toFormat() : balance.toTokens();
}

interface Props {
  addSign?: string;
  balance: Money | undefined;
  children?: React.ReactNode;
  className?: string;
  isShortFormat?: boolean;
  showAsset?: boolean;
  showUsdAmount?: boolean;
  split?: boolean;
}

export function Balance({
  addSign,
  balance,
  children,
  className,
  isShortFormat,
  showAsset,
  showUsdAmount,
  split,
  ...props
}: Props) {
  if (!balance) {
    return (
      <div>
        <Loader />
        {children}
      </div>
    );
  }

  if (balance?.getTokens().isNaN()) {
    return <div>N/A</div>;
  }

  const tokens = formatBalanceDisplay(balance, isShortFormat).split('.');

  const assetName = showAsset ? balance.asset.displayName : null;

  if (!split) {
    return (
      <>
        <div {...props} className={`${styles.amount} ${className}`}>
          {tokens.join('.')} {assetName} {children}
        </div>
        {showUsdAmount && (
          <UsdAmount
            className={styles.usdAmountNote}
            id={balance.asset.id}
            tokens={balance.getTokens()}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div {...props} className={clsx(className, styles.amount)}>
        <span className="font700">
          {addSign}
          {tokens[0]}
        </span>
        {tokens[1] ? <span className="font400">.{tokens[1]}</span> : null}
        &nbsp;
        <span className="font400">{assetName}</span>
        {children}
      </div>

      {showUsdAmount && (
        <UsdAmount
          className={styles.usdAmount}
          id={balance.asset.id}
          tokens={balance.getTokens()}
        />
      )}
    </>
  );
}
