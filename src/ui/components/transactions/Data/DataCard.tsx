import * as styles from './data.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { messageType } from './parseTx';
import { ShowScript } from '../../ui';
import { MessageCardComponentProps } from '../types';

class DataCardComponent extends React.PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(styles.dataTransactionCard, this.props.className, {
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
            isData={true}
            optional={true}
            showNotify={true}
            hideScript={this.props.collapsed}
          />
        </div>
      </div>
    );
  }
}

export const DataCard = withTranslation()(DataCardComponent);
