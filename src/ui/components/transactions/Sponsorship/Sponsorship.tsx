import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './sponsorship.styl';
import { SponsorshipCard } from './SponsorshipCard';

export function Sponsorship(props: MessageComponentProps) {
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
