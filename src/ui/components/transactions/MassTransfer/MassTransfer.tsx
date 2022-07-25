import * as styles from './massTransfer.styl';
import * as React from 'react';

import { MassTransferCard } from './MassTransferCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function MassTransfer(props) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.massTransferTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <MassTransferCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
