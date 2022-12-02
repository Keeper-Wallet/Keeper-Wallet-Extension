import clsx from 'clsx';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { ShowScript } from '../../ui';
import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './data.styl';
import { messageType } from './parseTx';

class DataCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = clsx(styles.dataTransactionCard, this.props.className, {
      [styles.dataCardCollapsed]: this.props.collapsed,
    });

    const { t, message } = this.props;

    const { data } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

    const tx = { type: data?.type, ...data?.data };

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.dataTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.dataTransaction')}
            </div>
            <h1 className="headline1">
              {t('transactions.dataTransactionName')}
            </h1>
          </div>
        </div>

        <div className={`${styles.cardContent} marginTop1`}>
          <ShowScript
            className={styles.dataScript}
            data={tx.data || []}
            isData
            optional
            showNotify
            hideScript={this.props.collapsed}
          />
        </div>
      </div>
    );
  }
}

export const DataCard = withTranslation()(DataCardComponent);
