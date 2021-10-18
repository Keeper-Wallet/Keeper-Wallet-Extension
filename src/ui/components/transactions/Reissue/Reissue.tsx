import * as styles from './index.styl';
import * as React from 'react';

import { ReissueCard } from './ReissueCard';
import { ReissueInfo } from './ReissueInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const Reissue = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.reissueTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <ReissueCard {...props} />
                </div>

                <TransactionDetails>
                    <ReissueInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
