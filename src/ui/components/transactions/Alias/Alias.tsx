import styles from './alias.styl';
import * as React from 'react';

import { AliasCard } from './AliasCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function Alias(props) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.aliasTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <AliasCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
