import * as styles from './package.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { getPackageAmounts, getFees, messageType } from './parseTx';
import { Balance } from '../../ui';

const Fees = ({ fees }) => {
  const moneys = Object.values(fees);

  return (
    <div className="margin-main">
      {moneys.map((fee: any) => {
        return (
          <div key={fee.asset.id}>
            <Balance balance={fee} isShortFormat={true} showAsset={true} />
          </div>
        );
      })}
    </div>
  );
};

interface IProps {
  assets: any;
  className?: string;
  collapsed: boolean;
  message: any;
}

export class PackageCard extends React.PureComponent<IProps> {
  render() {
    const { message, assets, collapsed, className } = this.props;
    const { data = {}, title = '' } = message;
    const tx = [...data];
    const fees = getFees(tx, assets);
    const amounts = getPackageAmounts(tx, assets);
    const myClassName = cn(styles.dataTransactionCard, className, {
      [styles.dataCard_collapsed]: collapsed,
    });

    return (
      <div
        className={`${myClassName} ${styles.packageTransactionCard} ${styles.groupTx}`}
      >
        <div className={styles.groupBottom}> </div>
        <div className={styles.groupEffect}>
          <div className={styles.cardHeader}>
            <div className={styles.dataTxIcon}>
              <TxIcon txType={messageType} />
            </div>

            <div>
              <div className="basic500 body3 margin-min">
                {title && collapsed ? (
                  title
                ) : (
                  <Trans i18nKey="transactions.packTransactionGroup" />
                )}
              </div>
              <h1 className="headline1 margin-main">
                {tx.length} <Trans i18nKey="transactions.packTransactions" />
              </h1>

              <div className={styles.amounts}>
                {amounts.map(({ amount, sign }, index) => (
                  <div key={`${index}${amount.asset.id}`}>
                    <Balance
                      balance={amount}
                      split
                      showAsset
                      addSign={`${sign}`}
                      showUsdAmount
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.origin}>
            <div className="basic500 body3 margin-min margin-main-top">
              <Trans i18nKey="transactions.packTransactionsFees" />
            </div>
            <div className="margin-min">
              <Fees fees={fees} />
            </div>
          </div>

          <div className={styles.cardContent} />
        </div>
      </div>
    );
  }
}
