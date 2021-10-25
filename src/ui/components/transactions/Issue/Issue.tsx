import * as styles from './issue.styl';
import * as React from 'react';

import { IssueCard } from './IssueCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export const Issue = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.issueTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <IssueCard {...props} />
                </div>

                <TxDetailTabs>
                    <TxInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
