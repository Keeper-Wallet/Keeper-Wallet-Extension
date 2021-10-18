import * as styles from './index.styl';
import * as React from 'react';

import { IssueCard } from './IssueCard';
import { IssueInfo } from './IssueInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const Issue = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.issueTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <IssueCard {...props} />
                </div>

                <TransactionDetails>
                    <IssueInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
