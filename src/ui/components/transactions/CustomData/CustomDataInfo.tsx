import * as React from 'react';
import { withTranslation } from 'react-i18next';
import * as styles from './customData.styl';
import { ComponentProps } from 'ui/components/transactions/BaseTransaction';

class CustomDataInfoComponent extends React.PureComponent<
  Pick<ComponentProps, 't' | 'message' | 'assets'>
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
