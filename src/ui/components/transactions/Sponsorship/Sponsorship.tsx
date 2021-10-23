import * as styles from './index.styl';
import * as React from 'react';

import { SponsorshipCard } from './SponsorshipCard';
import { SponsorshipInfo } from './SponsorshipInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const Sponsorship = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.sponsorshipTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <SponsorshipCard {...props} />
                </div>

                <TxDetailTabs>
                    <SponsorshipInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
