import * as styles from '../../pages/styles/transactions.styl';
import * as React from 'react';
import cn from 'classnames';
import { WithTranslation, withTranslation } from 'react-i18next';
import { MessageComponentProps } from '../types';

class OriginWarningComponent extends React.PureComponent<
  Pick<MessageComponentProps, 'message'> & WithTranslation
> {
  render() {
    const { t, message } = this.props;
    const { network } = message.account;

    if (!message.origin) {
      return null;
    }

    return (
      <React.Fragment>
        <div className={cn(styles.originAddress, 'flex')}>{message.origin}</div>
        <div className={cn(styles.originNetwork, 'flex')}>
          <i className={cn(styles.originNetworkIcon, 'networkIcon')}> </i>
          <span className={styles.networkBottom}>{t(`bottom.${network}`)}</span>
        </div>
      </React.Fragment>
    );
  }
}

export const OriginWarning = withTranslation()(OriginWarningComponent);
