import * as styles from './cancelLease.styl';
import * as React from 'react';

import { CancelLeaseCard } from './CancelLeaseCard';
import { CancelLeaseInfo } from './CancelLeaseInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const CancelLease = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.cancelLeaseTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <CancelLeaseCard {...props} />
                </div>

                <TransactionDetails>
                    <CancelLeaseInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
