import styles from './burn.styl';
import * as React from 'react';

import { BurnCard } from './BurnCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function Burn(props) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.burnTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <BurnCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
