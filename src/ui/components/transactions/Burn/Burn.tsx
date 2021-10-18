import * as styles from './burn.styl';
import * as React from 'react';

import { BurnCard } from './BurnCard';
import { BurnInfo } from './BurnInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const Burn = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.burnTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <BurnCard {...props} />
                </div>

                <TransactionDetails>
                    <BurnInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
