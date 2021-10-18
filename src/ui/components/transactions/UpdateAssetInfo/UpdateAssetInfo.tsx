import * as styles from './index.styl';
import * as React from 'react';

import { UpdateAssetInfoCard } from './UpdateAssetInfoCard';
import { UpdateAssetInfoInfo } from './UpdateAssetInfoInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const UpdateAssetInfo = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.updateAssetInfoTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <UpdateAssetInfoCard {...props} />
                </div>

                <TransactionDetails>
                    <UpdateAssetInfoInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
