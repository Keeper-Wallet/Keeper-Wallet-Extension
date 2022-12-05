import clsx from 'clsx';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './alias.styl';
import { messageType } from './parseTx';

class AliasCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = clsx(styles.aliasTransactionCard, this.props.className, {
      [styles.aliasCardCollapsed]: this.props.collapsed,
    });

    const { t, message } = this.props;

    const { data: tx } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

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
            <h1 className="headline1" data-testid="aliasValue">
              {tx.data.alias}
            </h1>
          </div>
        </div>

        <div className={styles.cardContent} />
      </div>
    );
  }
}

export const AliasCard = withTranslation()(AliasCardComponent);
