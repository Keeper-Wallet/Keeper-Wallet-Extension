import * as styles from './index.styl';
import * as React from 'react';

import { DataCard } from './DataCard';
import { DataInfo } from './DataInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const Data = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.dataTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <DataCard {...props} />
                </div>

                <TransactionDetails>
                    <DataInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
