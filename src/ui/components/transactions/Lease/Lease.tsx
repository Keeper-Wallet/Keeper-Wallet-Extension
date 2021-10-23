import * as styles from './lease.styl';
import * as React from 'react';

import { LeaseCard } from './LeaseCard';
import { LeaseInfo } from './LeaseInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const Lease = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.leaseTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <LeaseCard {...props} />
                </div>

                <TxDetailTabs>
                    <LeaseInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
