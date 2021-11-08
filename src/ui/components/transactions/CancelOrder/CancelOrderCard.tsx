import * as styles from './cancelOrder.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { messageType } from './parseTx';

interface IProps {
  assets: any;
  className: string;
  collapsed: boolean;
  message: any;
}

export class CancelOrderCard extends React.PureComponent<IProps> {
  render() {
    const className = cn(
      styles.cancelOrderTransactionCard,
      this.props.className,
      {
        [styles.cancelOrderCard_collapsed]: this.props.collapsed,
      }
    );

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.cancelOrderTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              <Trans i18nKey="transactions.dex" />
            </div>
            <h1 className="headline1">
              <Trans i18nKey="transactions.orderCancel" />
            </h1>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.txRow}>
            <div className="tx-title tag1 basic500">
              <Trans i18nKey="transactions.orderId" />
            </div>
            <div className={styles.txValue}>
              {this.props.message?.data?.data?.id}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
