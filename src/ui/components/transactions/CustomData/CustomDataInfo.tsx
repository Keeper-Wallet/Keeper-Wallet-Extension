import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import * as styles from './customData.styl';
import { AssetDetail } from 'ui/services/Background';

interface IProps extends WithTranslation {
  message: any;
  assets: Record<string, AssetDetail>;
}

class CustomDataInfoComponent extends React.PureComponent<IProps> {
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
