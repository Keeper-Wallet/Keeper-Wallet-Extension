import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './originAuth.styl';

interface IProps {
  message: any;
  assets: any;
}

export class OriginAuthInfo extends React.PureComponent<IProps> {
  render() {
    return (
      <div>
        <div
          className={`${styles.infoBlock} margin-main-big-top info-block body3 basic500 left`}
        >
          <div>
            <i className="inactive-account-icon" />
          </div>
          <div>
            <Trans i18nKey="sign.signAccessInfo" />
          </div>
        </div>
      </div>
    );
  }
}
