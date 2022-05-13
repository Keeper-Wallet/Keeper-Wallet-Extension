import * as styles from '../../pages/styles/transactions.styl';
import * as React from 'react';
import cn from 'classnames';
import { withTranslation } from 'react-i18next';
import { ComponentProps } from 'ui/components/transactions/BaseTransaction/index';

class OriginWarningComponent extends React.PureComponent<
  Pick<ComponentProps, 't' | 'message'>
> {
  render(): React.ReactNode {
    const { t, message } = this.props;
    const {
      account: { network },
    } = message;

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
