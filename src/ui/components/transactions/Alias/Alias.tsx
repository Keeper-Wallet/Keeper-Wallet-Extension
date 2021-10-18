import * as styles from './alias.styl';
import * as React from 'react';

import { AliasCard } from './AliasCard';
import { AliasInfo } from './AliasInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const Alias = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.aliasTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <AliasCard {...props} />
                </div>

                <TransactionDetails>
                    <AliasInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
