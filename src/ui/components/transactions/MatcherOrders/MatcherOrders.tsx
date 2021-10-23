import * as styles from './matcher.styl';
import * as React from 'react';

import { MatcherCard } from './MatcherCard';
import { MatcherInfo } from './MatcherInfo';
import { TxFooter, TxHeader } from '../BaseTransaction';

export const MatcherOrders = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.matcherTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <MatcherCard {...props} />
                </div>

                <MatcherInfo message={message} assets={assets} />
            </div>

            <TxFooter {...props} />
        </div>
    );
};
