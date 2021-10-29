import * as styles from './burn.styl';
import * as React from 'react';

import { BurnCard } from './BurnCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function Burn(props) {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.burnTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <BurnCard {...props} />
                </div>

                <TxDetailTabs>
                    <TxInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
}
