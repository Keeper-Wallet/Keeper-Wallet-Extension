import * as styles from './transfer.styl';
import * as React from 'react';

import { TransferCard } from './TransferCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';
import { MessageComponentProps } from '../types';

export function Transfer(props: MessageComponentProps) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.transferTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <TransferCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
