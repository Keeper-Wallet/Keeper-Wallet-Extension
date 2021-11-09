import * as styles from './transfer.styl';
import * as React from 'react';

import { TransferCard } from './TransferCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function Transfer(props) {
  const { sponsoredBalance } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.transferTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <TransferCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo sponsoredBalance={sponsoredBalance} />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
