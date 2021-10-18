import * as styles from './createOrder.styl';
import * as React from 'react';

import { CreateOrderCard } from './CreateOrderCard';
import { CreateOrderInfo } from './CreateOrderInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';

export const CreateOrder = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.createOrderTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <CreateOrderCard {...props} />
                </div>

                <CreateOrderInfo message={message} assets={assets} />
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
