import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import * as styles from './matcher.styl';

interface IProps extends WithTranslation {
  message: any;
  assets: any;
}

class MatcherInfoComponent extends React.PureComponent<IProps> {
  render() {
    const { t, message } = this.props;
    const { messageHash, data } = message;

    return (
      <div>
        <div className={`${styles.txRow}`}>
          <div className="tx-title body3 basic500">
            {t('transactions.matcherTimeStamp')}
          </div>
          <div className={styles.txValue}>{data.data.timestamp}</div>
        </div>

        <div className={styles.txRow}>
          <div className="tx-title body3 basic500">
            {t('transactions.dataHash')}
          </div>
          <div className={styles.txValue}>{messageHash}</div>
        </div>
      </div>
    );
  }
}

export const MatcherInfo = withTranslation()(MatcherInfoComponent);
