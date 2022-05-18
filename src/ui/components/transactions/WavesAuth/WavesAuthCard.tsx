import * as styles from './wavesAuth.styl';
import * as React from 'react';
import cn from 'classnames';
import { withTranslation } from 'react-i18next';
import { ComponentProps, TxIcon } from '../BaseTransaction';

class WavesAuthCardComponent extends React.PureComponent<ComponentProps> {
  render() {
    const { t, message, collapsed } = this.props;
    const { origin } = message;
    const className = cn(
      styles.wavesAuthTransactionCard,
      this.props.className,
      {
        [styles.wavesAuthCard_collapsed]: this.props.collapsed,
      }
    );

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          {collapsed ? (
            <React.Fragment>
              <div className={styles.smallCardContent}>
                <div className={styles.wavesAuthTxIconSmall}>
                  <TxIcon txType={'authOrigin'} small={true} />
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
            </React.Fragment>
          ) : (
            <div className={styles.wavesAuthTxIcon}>
              <TxIcon txType={'authOrigin'} />
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
