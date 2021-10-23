import * as styles from './transfer.styl';
import * as React from 'react';

import { TransferCard } from './TransferCard';
import { TransferInfo } from './TransferInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const Transfer = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.transferTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <TransferCard {...props} />
                </div>

                <TxDetailTabs>
                    <TransferInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
