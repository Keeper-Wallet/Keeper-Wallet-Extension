import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { AssetsRecord } from 'assets/types';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'ui/store';

import { getAsset } from '../../../actions/assets';
import { Loader } from '../loader';
import { UsdAmount } from '../UsdAmount';
import * as styles from './Balance.module.css';

const SEPARATOR = '.';

const Loading = ({ children }: { children: React.ReactNode }) => (
  <div>
    <Loader />
    {children}
  </div>
);

interface Props {
  balance: Money | string | BigNumber | undefined;
  assetId?: string;
  split?: boolean;
  showAsset?: boolean;
  showUsdAmount?: boolean;
  isShortFormat?: boolean;
  children?: React.ReactNode;
  addSign?: string;
  className?: string;
  assets: AssetsRecord;
  getAsset: (id: string) => void;
}

const BalanceComponent = ({
  balance,
  split,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  getAsset,
  addSign,
  className,
  showAsset,
  showUsdAmount,
  isShortFormat,
  children,
  assets,
  assetId = 'WAVES',
  ...props
}: Props) => {
  let balanceOut: Money;

  useEffect(() => {
    if (!assets[assetId]) {
      getAsset(assetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  switch (true) {
    case !assets[assetId] || !balance:
      return <Loading>{children}</Loading>;
    case balance instanceof Money && !balance.getTokens().isNaN():
      balanceOut = balance as Money;
      break;
    case new BigNumber(balance as string).isNaN() === false:
      balanceOut = Money.fromTokens(balance as string, new Asset(assets.WAVES));
      break;
    default:
      return <div>N/A</div>;
  }

  const tokens = (
    isShortFormat ? balanceOut.toFormat() : balanceOut.toTokens()
  ).split('.');
  const assetName = showAsset ? balanceOut.asset.displayName : null;

  if (!split) {
    return (
      <>
        <div {...props} className={`${styles.amount} ${className}`}>
          {tokens.join(SEPARATOR)} {assetName} {children}
        </div>
        {showUsdAmount && (
          <UsdAmount
            className={styles.usdAmountNote}
            id={balanceOut.asset.id}
            tokens={balanceOut.getTokens()}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div {...props} className={`${styles.amount} ${className}`}>
        {addSign ? <span>{addSign}</span> : null}
        <span className="font700">{tokens[0]}</span>
        {tokens[1] ? (
          <span className="font400">
            {SEPARATOR}
            {tokens[1]}
          </span>
        ) : null}
        &nbsp;
        <span className="font400">{assetName}</span>
        {children}
      </div>
      {showUsdAmount && (
        <UsdAmount
          className={styles.usdAmount}
          id={balanceOut.asset.id}
          tokens={balanceOut.getTokens()}
        />
      )}
    </>
  );
};

export const Balance = connect(({ assets }: AppState) => ({ assets }), {
  getAsset,
})(BalanceComponent);
