import * as React from 'react';
import { withTranslation } from 'react-i18next';
import styles from './auth.styl';
import { ComponentProps } from 'ui/components/transactions/BaseTransaction';

class AuthInfoComponent extends React.PureComponent<
  Pick<ComponentProps, 't' | 'message' | 'assets'>
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
