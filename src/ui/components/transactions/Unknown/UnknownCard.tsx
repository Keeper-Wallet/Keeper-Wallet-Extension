import * as styles from './unknown.styl';
import * as React from 'react';
import cn from 'classnames';
import { TxIcon } from '../BaseTransaction';
import { messageType } from './parseTx';

interface IProps {
  className: string;
  collapsed: boolean;
  message: any;
}

export class UnknownCard extends React.PureComponent<IProps> {
  render() {
    const className = cn(styles.unknownTransactionCard, this.props.className, {
      [styles.authCard_collapsed]: this.props.collapsed,
    });

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
