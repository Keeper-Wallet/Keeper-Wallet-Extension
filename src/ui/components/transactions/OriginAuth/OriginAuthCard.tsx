import clsx from 'clsx';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './originAuth.styl';
import { messageType } from './parseTx';

class OriginAuthCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const { t, message, collapsed } = this.props;
    const { origin } = message;
    const className = clsx(
      styles.originAuthTransactionCard,
      this.props.className
    );

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          {collapsed ? (
            <>
              <div className={styles.smallCardContent}>
                <div className={styles.originAuthTxIconSmall}>
                  <TxIcon txType={messageType} small />
                </div>
                <div>
                  <div className="basic500 body3 margin-min origin-ellipsis">
                    {origin}
                  </div>
                  <h1 className="headline1">
                    {t('transactions.allowAccessTitle')}
                  </h1>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.originAuthTxIcon}>
              <TxIcon txType={messageType} />
            </div>
          )}
        </div>
        {collapsed ? null : <div className={styles.cardContent} />}
      </div>
    );
  }
}

export const OriginAuthCard = withTranslation()(OriginAuthCardComponent);
