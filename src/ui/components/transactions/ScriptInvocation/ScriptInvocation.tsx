import * as styles from './scriptInvocation.styl';
import * as React from 'react';

import { ScriptInvocationCard } from './ScriptInvocationCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';
import { MessageComponentProps } from '../types';

export function ScriptInvocation(props: MessageComponentProps) {
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
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
