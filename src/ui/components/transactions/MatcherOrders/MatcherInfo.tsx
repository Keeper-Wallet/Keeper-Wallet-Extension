import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { MessageComponentProps } from '../types';
import * as styles from './matcher.styl';

class MatcherInfoComponent extends PureComponent<
  Pick<MessageComponentProps, 'message' | 'assets'> & WithTranslation
> {
  render() {
    const { t, message } = this.props;

    const { messageHash, data } = message as Extract<
      typeof message,
      { type: 'request' }
    >;

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
