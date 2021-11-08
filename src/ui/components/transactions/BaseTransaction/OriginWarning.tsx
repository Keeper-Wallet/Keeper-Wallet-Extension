import * as styles from '../../pages/styles/transactions.styl';
import * as React from 'react';
import cn from 'classnames';
import { Trans } from 'react-i18next';

export class OriginWarning extends React.PureComponent<{ message: any }> {
  render(): React.ReactNode {
    const { message } = this.props;
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
          <span className={styles.networkBottom}>
            <Trans i18nKey={`bottom.${network}`} />
          </span>
        </div>
      </React.Fragment>
    );
  }
}
