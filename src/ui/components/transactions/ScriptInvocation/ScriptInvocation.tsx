import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './scriptInvocation.styl';
import { ScriptInvocationCard } from './ScriptInvocationCard';

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
