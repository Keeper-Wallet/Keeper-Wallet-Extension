import * as styles from './massTransfer.styl';
import * as React from 'react';

import { MassTransferCard } from './MassTransferCard';
import { MassTransferInfo } from './MassTransferInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const MassTransfer = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.massTransferTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <MassTransferCard {...props} />
                </div>

                <TransactionDetails>
                    <MassTransferInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
