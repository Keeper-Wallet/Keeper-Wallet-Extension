import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './createOrder.styl';
import { CreateOrderCard } from './CreateOrderCard';
import { CreateOrderInfo } from './CreateOrderInfo';

export function CreateOrder(props: MessageComponentProps) {
  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.createOrderTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <CreateOrderCard {...props} />
        </div>

        <TxDetailTabs>
          <CreateOrderInfo message={message} assets={assets} />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
