import * as styles from './reissue.styl';
import * as React from 'react';

import { ReissueCard } from './ReissueCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function Reissue(props) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.reissueTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <ReissueCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
