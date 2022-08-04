import * as styles from './createOrder.styl';
import * as React from 'react';

import { CreateOrderCard } from './CreateOrderCard';
import { CreateOrderInfo } from './CreateOrderInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';
import { MessageComponentProps } from '../types';

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
