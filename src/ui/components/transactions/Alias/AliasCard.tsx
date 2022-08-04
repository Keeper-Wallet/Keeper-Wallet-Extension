import * as styles from './alias.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { messageType } from './parseTx';
import { MessageCardComponentProps } from '../types';

class AliasCardComponent extends React.PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(styles.aliasTransactionCard, this.props.className, {
      [styles.aliasCardCollapsed]: this.props.collapsed,
    });

    const { t, message } = this.props;
    const { data: tx } = message;

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.aliasTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.createAlias')}
            </div>
            <h1 className="headline1">{tx.data.alias}</h1>
          </div>
        </div>

        <div className={styles.cardContent} />
      </div>
    );
  }
}

export const AliasCard = withTranslation()(AliasCardComponent);
