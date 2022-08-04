import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { MessageComponentProps } from '../types';
import * as styles from './auth.styl';

class AuthInfoComponent extends React.PureComponent<
  Pick<MessageComponentProps, 'message' | 'assets'> & WithTranslation
> {
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
