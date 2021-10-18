import * as styles from './index.styl';
import * as React from 'react';

import { SponsorshipCard } from './SponsorshipCard';
import { SponsorshipInfo } from './SponsorshipInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const Sponsorship = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.sponsorshipTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <SponsorshipCard {...props} />
                </div>

                <TransactionDetails>
                    <SponsorshipInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
