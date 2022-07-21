import styles from './createOrder.styl';
import * as React from 'react';

import { CreateOrderCard } from './CreateOrderCard';
import { CreateOrderInfo } from './CreateOrderInfo';
import {
  ComponentProps,
  TxDetailTabs,
  TxFooter,
  TxHeader,
} from '../BaseTransaction';

export function CreateOrder(props: ComponentProps) {
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
