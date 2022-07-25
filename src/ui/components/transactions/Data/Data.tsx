import * as styles from './data.styl';
import * as React from 'react';

import { DataCard } from './DataCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function Data(props) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.dataTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <DataCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
