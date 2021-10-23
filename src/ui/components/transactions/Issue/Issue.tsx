import * as styles from './index.styl';
import * as React from 'react';

import { IssueCard } from './IssueCard';
import { IssueInfo } from './IssueInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

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
                    <IssueInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
