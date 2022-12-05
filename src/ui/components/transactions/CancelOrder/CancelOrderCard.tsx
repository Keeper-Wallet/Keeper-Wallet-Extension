import clsx from 'clsx';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './cancelOrder.styl';
import { messageType } from './parseTx';

class CancelOrderCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const { className, collapsed, message, t } = this.props;

    const { data } = message as Extract<
      typeof message,
      { type: 'cancelOrder' }
    >;

    return (
      <div
        className={clsx(styles.cancelOrderTransactionCard, className, {
          [styles.cancelOrderCardCollapsed]: collapsed,
        })}
      >
        <div className={styles.cardHeader}>
          <div className={styles.cancelOrderTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.dex')}
            </div>
            <h1 className="headline1">{t('transactions.orderCancel')}</h1>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.orderId')}
            </div>
            <div className={styles.txValue} data-testid="cancelOrderOrderId">
              {data?.data?.id}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const CancelOrderCard = withTranslation()(CancelOrderCardComponent);
