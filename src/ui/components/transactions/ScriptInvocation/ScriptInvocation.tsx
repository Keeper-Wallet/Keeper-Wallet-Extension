import * as styles from './scriptInvocation.styl';
import * as React from 'react';

import { ScriptInvocationCard } from './ScriptInvocationCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function ScriptInvocation(props) {
  const { sponsoredBalance } = props;
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div
        className={`${styles.scriptInvocationTxScrollBox} transactionContent`}
      >
        <div className="margin-main">
          <ScriptInvocationCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo sponsoredBalance={sponsoredBalance} />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
