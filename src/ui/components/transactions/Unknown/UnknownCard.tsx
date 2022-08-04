import * as styles from './unknown.styl';
import * as React from 'react';
import cn from 'classnames';
import { TxIcon } from '../BaseTransaction';
import { messageType } from './parseTx';
import { MessageCardComponentProps } from '../types';

export class UnknownCard extends React.PureComponent<MessageCardComponentProps> {
  render() {
    const className = cn(styles.unknownTransactionCard, this.props.className);

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.unknownTxIcon}>
            <TxIcon txType={messageType} />
          </div>
        </div>

        <div className={styles.cardContent} />
      </div>
    );
  }
}
