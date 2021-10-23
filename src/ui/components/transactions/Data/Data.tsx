import * as styles from './index.styl';
import * as React from 'react';

import { DataCard } from './DataCard';
import { DataInfo } from './DataInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const Data = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.dataTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <DataCard {...props} />
                </div>

                <TxDetailTabs>
                    <DataInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
