import styles from './sponsorship.styl';
import * as React from 'react';

import { SponsorshipCard } from './SponsorshipCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function Sponsorship(props) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.sponsorshipTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <SponsorshipCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
