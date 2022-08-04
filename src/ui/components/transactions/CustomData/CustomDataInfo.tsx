import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { MessageComponentProps } from '../types';
import * as styles from './customData.styl';

class CustomDataInfoComponent extends React.PureComponent<
  Pick<MessageComponentProps, 'message' | 'assets'> & WithTranslation
> {
  render() {
    const { t, message } = this.props;
    const { messageHash } = message;

    return (
      <div>
        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">{t('transactions.txid')}</div>
          <div className={styles.txValue}>{messageHash}</div>
        </div>
      </div>
    );
  }
}

export const CustomDataInfo = withTranslation()(CustomDataInfoComponent);
