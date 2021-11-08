import * as styles from './scriptInvocation.styl';
import * as React from 'react';

import { ScriptInvocationCard } from './ScriptInvocationCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function ScriptInvocation(props) {
  const { message, assets } = props;

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
          <TxInfo message={message} assets={assets} />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
