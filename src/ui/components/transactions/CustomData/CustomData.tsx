import * as styles from './customData.styl';
import * as React from 'react';

import { CustomDataCard } from './CustomDataCard';
import { CustomDataInfo } from './CustomDataInfo';
import { TxFooter, TxHeader } from '../BaseTransaction';

export const CustomData = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.dataTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <CustomDataCard {...props} />
                </div>

                <CustomDataInfo message={message} assets={assets} />
            </div>

            <TxFooter {...props} />
        </div>
    );
};
