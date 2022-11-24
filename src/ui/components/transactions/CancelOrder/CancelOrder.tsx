import { TxFooter, TxHeader } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './cancelOrder.styl';
import { CancelOrderCard } from './CancelOrderCard';
import { CancelOrderInfo } from './CancelOrderInfo';

export function CancelOrder(props: MessageComponentProps) {
  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.cancelOrderTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <CancelOrderCard {...props} />
        </div>

        <CancelOrderInfo message={message} assets={assets} />
      </div>

      <TxFooter {...props} />
    </div>
  );
}
