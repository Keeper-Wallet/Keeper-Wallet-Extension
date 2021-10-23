import * as styles from './massTransfer.styl';
import * as React from 'react';

import { MassTransferCard } from './MassTransferCard';
import { MassTransferInfo } from './MassTransferInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const MassTransfer = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.massTransferTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <MassTransferCard {...props} />
                </div>

                <TxDetailTabs>
                    <MassTransferInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
