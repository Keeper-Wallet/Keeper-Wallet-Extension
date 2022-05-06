import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import * as styles from './auth.styl';
import { AssetDetail } from 'ui/services/Background';

interface IProps extends WithTranslation {
  message: any;
  assets: Record<string, AssetDetail>;
}

class AuthInfoComponent extends React.PureComponent<IProps> {
  render() {
    const { t, message } = this.props;
    const { messageHash } = message;

    return (
      <div>
        <div
          className={`${styles.txRow} ${styles.borderedBottom} margin-main-big `}
        >
          <div className="tx-title body3 basic500">
            {t('transactions.dataHash')}
          </div>
          <div className={styles.txValue}>{messageHash}</div>
        </div>

        <div className={`${styles.infoBlock} info-block body3 basic500 left`}>
          <div>
            <i className="inactive-account-icon" />
          </div>
          <div>{t('sign.signAccessInfo')}</div>
        </div>
      </div>
    );
  }
}

export const AuthInfo = withTranslation()(AuthInfoComponent);
