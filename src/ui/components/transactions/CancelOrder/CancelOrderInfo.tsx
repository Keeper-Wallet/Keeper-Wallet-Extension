import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import * as styles from './cancelOrder.styl';
import { DateFormat } from '../../ui';
import { AssetDetail } from 'ui/services/Background';

interface IProps extends WithTranslation {
  message: any;
  assets: Record<string, AssetDetail>;
}

class CancelOrderInfoComponent extends React.PureComponent<IProps> {
  render() {
    const { t, message } = this.props;
    const { messageHash, data = {} } = message;
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
