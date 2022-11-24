import cn from 'classnames';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './wavesAuth.styl';

class WavesAuthCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const { t, message, collapsed } = this.props;
    const { origin } = message;
    const className = cn(
      styles.wavesAuthTransactionCard,
      this.props.className,
      {
        [styles.wavesAuthCardCollapsed]: this.props.collapsed,
      }
    );

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          {collapsed ? (
            <>
              <div className={styles.smallCardContent}>
                <div className={styles.wavesAuthTxIconSmall}>
                  <TxIcon txType="authOrigin" small />
                </div>
                <div>
                  <div className="basic500 body3 margin-min origin-ellipsis">
                    {origin}
                  </div>
                  <h1 className="headline1">
                    {t('transactions.signRequestWavesAuth')}
                  </h1>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.wavesAuthTxIcon}>
              <TxIcon txType="authOrigin" />
            </div>
          )}
        </div>
        {collapsed ? null : (
          <div className={styles.cardContent}>
            <div className={styles.wavesAuthOriginAddress}>{origin}</div>
            <div className={styles.wavesAuthOriginDescription}>
              {t('transactions.originWarning')}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export const WavesAuthCard = withTranslation()(WavesAuthCardComponent);
