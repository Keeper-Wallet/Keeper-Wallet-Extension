import * as styles from './index.styl';
import * as React from 'react';

import { CustomDataCard } from './CustomDataCard';
import { CustomDataInfo } from './CustomDataInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';

export const CustomData = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.dataTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <CustomDataCard {...props} />
                </div>

                <CustomDataInfo message={message} assets={assets} />
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
