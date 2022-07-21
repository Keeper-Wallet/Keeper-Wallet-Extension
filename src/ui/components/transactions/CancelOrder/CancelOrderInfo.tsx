import * as React from 'react';
import { withTranslation } from 'react-i18next';
import styles from './cancelOrder.styl';
import { DateFormat } from '../../ui';
import {
  ComponentProps,
  MessageData,
} from 'ui/components/transactions/BaseTransaction';

class CancelOrderInfoComponent extends React.PureComponent<
  Pick<ComponentProps, 't' | 'message' | 'assets'>
> {
  render() {
    const { t, message } = this.props;
    const { messageHash, data = {} as MessageData } = message;
    const tx = { type: data.type, ...data.data };

    return (
      <div>
        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">{t('transactions.txid')}</div>
          <div className={styles.txValue}>{messageHash}</div>
        </div>

        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.txTime')}
          </div>
          <div className={styles.txValue}>
            <DateFormat date={tx.timestamp} />
          </div>
        </div>
      </div>
    );
  }
}

export const CancelOrderInfo = withTranslation()(CancelOrderInfoComponent);
