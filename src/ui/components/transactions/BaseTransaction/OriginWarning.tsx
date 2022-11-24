import cn from 'classnames';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import * as styles from '../../pages/styles/transactions.styl';
import { MessageComponentProps } from '../types';

class OriginWarningComponent extends PureComponent<
  Pick<MessageComponentProps, 'message'> & WithTranslation
> {
  render() {
    const { t, message } = this.props;
    const { network } = message.account;

    if (!message.origin) {
      return null;
    }

    return (
      <>
        <div className={cn(styles.originAddress, 'flex')}>{message.origin}</div>
        <div className={cn(styles.originNetwork, 'flex')}>
          <i className={cn(styles.originNetworkIcon, 'networkIcon')}> </i>
          <span className={styles.networkBottom}>{t(`bottom.${network}`)}</span>
        </div>
      </>
    );
  }
}

export const OriginWarning = withTranslation()(OriginWarningComponent);
