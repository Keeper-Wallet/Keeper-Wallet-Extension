import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './burn.styl';
import { BurnCard } from './BurnCard';

export function Burn(props: MessageComponentProps) {
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
