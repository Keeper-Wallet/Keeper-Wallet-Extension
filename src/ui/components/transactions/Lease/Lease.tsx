import * as styles from './lease.styl';
import * as React from 'react';

import { LeaseCard } from './LeaseCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function Lease(props) {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.leaseTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <LeaseCard {...props} />
                </div>

                <TxDetailTabs>
                    <TxInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
}
