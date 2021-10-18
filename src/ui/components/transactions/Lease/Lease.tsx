import * as styles from './lease.styl';
import * as React from 'react';

import { LeaseCard } from './LeaseCard';
import { LeaseInfo } from './LeaseInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const Lease = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.leaseTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <LeaseCard {...props} />
                </div>

                <TransactionDetails>
                    <LeaseInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
