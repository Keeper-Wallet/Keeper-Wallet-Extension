import * as styles from './index.styl';
import * as React from 'react';

import { UpdateAssetInfoCard } from './UpdateAssetInfoCard';
import { UpdateAssetInfoInfo } from './UpdateAssetInfoInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const UpdateAssetInfo = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.updateAssetInfoTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <UpdateAssetInfoCard {...props} />
                </div>

                <TxDetailTabs>
                    <UpdateAssetInfoInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
