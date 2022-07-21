import * as React from 'react';
import { withTranslation } from 'react-i18next';
import styles from './originAuth.styl';
import { ComponentProps } from 'ui/components/transactions/BaseTransaction';

class OriginAuthInfoComponent extends React.PureComponent<
  Pick<ComponentProps, 't' | 'message' | 'assets'>
> {
  render() {
    const { t } = this.props;
    return (
      <div>
        <div
          className={`${styles.infoBlock} margin-main-big-top info-block body3 basic500 left`}
        >
          <div>
            <i className="inactive-account-icon" />
          </div>
          <div>{t('sign.signAccessInfo')}</div>
        </div>
      </div>
    );
  }
}

export const OriginAuthInfo = withTranslation()(OriginAuthInfoComponent);
