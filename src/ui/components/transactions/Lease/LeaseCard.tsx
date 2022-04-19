import * as styles from './lease.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';

interface IProps {
  assets: any;
  className: string;
  collapsed: boolean;
  message: any;
}

export class LeaseCard extends React.PureComponent<IProps> {
  render() {
    const className = cn(styles.leaseTransactionCard, this.props.className, {
      [styles.leaseCard_collapsed]: this.props.collapsed,
    });

    const { message, assets } = this.props;
    const { data = {} } = message;
    const tx = { type: data.type, ...data.data };
    const amount = getMoney(getAmount(tx), assets);

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.leaseTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              <Trans i18nKey="transactions.lease" />
            </div>
            <h1 className="headline1">
              <Balance
                split={true}
                showAsset={true}
                balance={amount}
                showUsdAmount
              />
            </h1>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.txRow}>
            <div className="tx-title tag1 basic500">
              <Trans i18nKey="transactions.recipient" />
            </div>
            <div className={styles.txValue}>{tx.recipient}</div>
          </div>
        </div>
      </div>
    );
  }
}
