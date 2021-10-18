import * as styles from './matcher.styl';
import * as React from 'react';

import { MatcherCard } from './MatcherCard';
import { MatcherInfo } from './MatcherInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';

export const MatcherOrders = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.matcherTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <MatcherCard {...props} />
                </div>

                <MatcherInfo message={message} assets={assets} />
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
