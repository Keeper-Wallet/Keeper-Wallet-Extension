import * as React from 'react';
import { Asset, Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import { Loader } from '../loader';
import { connect } from 'react-redux';
import { getAsset } from '../../../actions';
import { AssetDetail } from 'ui/services/Background';
import { UsdAmount } from '../UsdAmount';
import * as styles from './Balance.module.css';

const SEPARATOR = '.';

const Loading = ({ children }) => (
  <div>
    <Loader />
    {children}
  </div>
);

interface Props {
  balance: Money | string | BigNumber;
  assetId?: string;
  split?: boolean;
  showAsset?: boolean;
  showUsdAmount?: boolean;
  isShortFormat?: boolean;
  children?: any;
  addSign?: string;
  className?: string;
  assets?: Record<string, AssetDetail>;
  getAsset: (id: string) => void;
}

const BalanceComponent = ({
  balance,
  split,
  getAsset,
  addSign = null,
  showAsset,
  showUsdAmount,
  isShortFormat,
  children,
  assets,
  assetId = 'WAVES',
  ...props
}: Props) => {
  let balanceOut: Money;

  React.useEffect(() => {
    if (!assets[assetId]) {
      getAsset(assetId);
    }
  }, []);

  switch (true) {
    case !assets[assetId] || !balance:
      return <Loading>{children}</Loading>;
    case balance instanceof Money && !balance.getTokens().isNaN():
      balanceOut = balance as Money;
      break;
    case new BigNumber(balance as string).isNaN() === false:
      balanceOut = Money.fromTokens(
        balance as string,
        new Asset(assets['WAVES'])
      );
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
      <div {...props}>
        {tokens.join(SEPARATOR)} {assetName}
        {showUsdAmount && (
          <UsdAmount
            className={styles.usdAmountNote}
            asset={assets[balanceOut.asset.id]}
            amount={+balanceOut.toTokens()}
          />
        )}
        {children}
      </div>
    );
  }

  return (
    <div {...props}>
      {addSign ? <span>{addSign}</span> : null}
      <span className="font600">{tokens[0]}</span>
      {tokens[1] ? (
        <span className="font400">
          {SEPARATOR}
          {tokens[1]}
        </span>
      ) : null}
      &nbsp;
      <span className="font400">{assetName}</span>
      {showUsdAmount && (
        <UsdAmount
          className={styles.usdAmount}
          asset={assets[balanceOut.asset.id]}
          amount={+balanceOut.toTokens()}
        />
      )}
      {children}
    </div>
  );
};

export const Balance = connect(({ assets }: any) => ({ assets }), { getAsset })(
  BalanceComponent
);
