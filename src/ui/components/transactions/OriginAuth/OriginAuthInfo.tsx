import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import * as styles from './originAuth.styl';

interface IProps extends WithTranslation {
  message: any;
  assets: any;
}

class OriginAuthInfoComponent extends React.PureComponent<IProps> {
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
