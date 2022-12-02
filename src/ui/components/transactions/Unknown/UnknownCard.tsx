import clsx from 'clsx';
import { PureComponent } from 'react';

import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import { messageType } from './parseTx';
import * as styles from './unknown.styl';

export class UnknownCard extends PureComponent<MessageCardComponentProps> {
  render() {
    const className = clsx(styles.unknownTransactionCard, this.props.className);

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
