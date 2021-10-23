import * as styles from './index.styl';
import * as React from 'react';

import { ReissueCard } from './ReissueCard';
import { ReissueInfo } from './ReissueInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

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
                    <ReissueInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
