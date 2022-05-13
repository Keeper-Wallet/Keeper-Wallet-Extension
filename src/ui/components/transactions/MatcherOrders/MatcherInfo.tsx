import * as React from 'react';
import { withTranslation } from 'react-i18next';
import * as styles from './matcher.styl';
import { ComponentProps } from 'ui/components/transactions/BaseTransaction';

class MatcherInfoComponent extends React.PureComponent<
  Pick<ComponentProps, 't' | 'message' | 'assets'>
> {
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
