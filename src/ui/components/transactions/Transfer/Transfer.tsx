import * as styles from './transfer.styl';
import * as React from 'react';

import { TransferCard } from './TransferCard';
import {
  ComponentProps,
  TxDetailTabs,
  TxFooter,
  TxHeader,
  TxInfo,
} from '../BaseTransaction';

export function Transfer(props: ComponentProps) {
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
