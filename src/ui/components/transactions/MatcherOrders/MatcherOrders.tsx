import { TxFooter, TxHeader } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './matcher.styl';
import { MatcherCard } from './MatcherCard';
import { MatcherInfo } from './MatcherInfo';

export function MatcherOrders(props: MessageComponentProps) {
  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.matcherTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <MatcherCard {...props} />
        </div>

        <MatcherInfo message={message} assets={assets} />
      </div>

      <TxFooter {...props} />
    </div>
  );
}
