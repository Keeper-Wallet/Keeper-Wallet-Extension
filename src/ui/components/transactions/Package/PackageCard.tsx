import * as styles from './package.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { getFees, getPackageAmounts, messageType } from './parseTx';
import { Balance } from '../../ui';
import { Money } from '@waves/data-entities';
import { MessageCardComponentProps } from '../types';

const Fees = ({ fees }: { fees: Record<string, Money> }) => {
  const moneys = Object.values(fees);

  return (
    <div className="margin-main">
      {moneys.map((fee: Money) => {
        return (
          <div key={fee.asset.id}>
            <Balance
              data-testid="packageFeeItem"
              balance={fee}
              isShortFormat={true}
              showAsset={true}
            />
          </div>
        );
      })}
    </div>
  );
};

class PackageCardComponent extends React.PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const { t, message, assets, collapsed, className } = this.props;
    const { data = [], title = '' } = message;
    const tx = [...data];
    const fees = getFees(tx, assets);
    const amounts = getPackageAmounts(tx, assets);
    const myClassName = cn(styles.dataTransactionCard, className, {
      [styles.dataCardCollapsed]: collapsed,
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
                {title && collapsed
                  ? title
                  : t('transactions.packTransactionGroup')}
              </div>
              <h1
                className="headline1 margin-main"
                data-testid="packageCountTitle"
              >
                {tx.length} {t('transactions.packTransactions')}
              </h1>

              <div className={styles.amounts}>
                {amounts.map(({ amount, sign }, index) => (
                  <div key={`${index}${amount.asset.id}`}>
                    <Balance
                      data-testid="packageAmountItem"
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
              {t('transactions.packTransactionsFees')}
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

export const PackageCard = withTranslation()(PackageCardComponent);
