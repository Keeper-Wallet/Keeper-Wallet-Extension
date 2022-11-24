import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './alias.styl';
import { AliasCard } from './AliasCard';

export function Alias(props: MessageComponentProps) {
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
