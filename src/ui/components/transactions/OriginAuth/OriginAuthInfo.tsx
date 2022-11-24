import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { MessageComponentProps } from '../types';
import * as styles from './originAuth.styl';

class OriginAuthInfoComponent extends PureComponent<
  Pick<MessageComponentProps, 'message' | 'assets'> & WithTranslation
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
