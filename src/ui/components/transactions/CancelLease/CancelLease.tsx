import * as styles from './cancelLease.styl';
import * as React from 'react';

import { CancelLeaseCard } from './CancelLeaseCard';
import { CancelLeaseInfo } from './CancelLeaseInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const CancelLease = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.cancelLeaseTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <CancelLeaseCard {...props} />
                </div>

                <TxDetailTabs>
                    <CancelLeaseInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
