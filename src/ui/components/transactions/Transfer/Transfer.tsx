import * as styles from './transfer.styl';
import * as React from 'react';

import { TransferCard } from './TransferCard';
import { TransferInfo } from './TransferInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const Transfer = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.transferTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <TransferCard {...props} />
                </div>

                <TransactionDetails>
                    <TransferInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
