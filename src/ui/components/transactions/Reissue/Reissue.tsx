import * as styles from './index.styl';
import * as React from 'react';

import { ReissueCard } from './ReissueCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export const Reissue = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.reissueTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <ReissueCard {...props} />
                </div>

                <TxDetailTabs>
                    <TxInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
