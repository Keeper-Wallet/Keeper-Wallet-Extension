import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './cancelOrder.styl';
import { DateFormat } from '../../ui';

interface IProps {
  message: any;
  assets: any;
}

export class CancelOrderInfo extends React.PureComponent<IProps> {
  render() {
    const { message } = this.props;
    const { messageHash, data = {} } = message;
    const tx = { type: data.type, ...data.data };

    return (
      <div>
        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">
            <Trans i18nKey="transactions.txid" />
          </div>
          <div className={styles.txValue}>{messageHash}</div>
        </div>

        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">
            <Trans i18nKey="transactions.txTime" />
          </div>
          <div className={styles.txValue}>
            <DateFormat value={tx.timestamp} />
          </div>
        </div>
      </div>
    );
  }
}
