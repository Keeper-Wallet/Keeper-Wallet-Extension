import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './cancelLease.styl';
import { CancelLeaseCard } from './CancelLeaseCard';

export function CancelLease(props: MessageComponentProps) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.cancelLeaseTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <CancelLeaseCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
