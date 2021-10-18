import * as styles from './cancelOrder.styl';
import * as React from 'react';

import { CancelOrderCard } from './CancelOrderCard';
import { CancelOrderInfo } from './CancelOrderInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';

export const CancelOrder = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.cancelOrderTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <CancelOrderCard {...props} />
                </div>

                <CancelOrderInfo message={message} assets={assets} />
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
