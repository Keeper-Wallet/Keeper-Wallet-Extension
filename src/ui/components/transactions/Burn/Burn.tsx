import * as styles from './burn.styl';
import * as React from 'react';

import { BurnCard } from './BurnCard';
import { BurnInfo } from './BurnInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const Burn = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.burnTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <BurnCard {...props} />
                </div>

                <TxDetailTabs>
                    <BurnInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
