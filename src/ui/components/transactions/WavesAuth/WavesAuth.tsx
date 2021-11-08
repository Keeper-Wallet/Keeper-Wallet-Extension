import * as styles from './wavesAuth.styl';
import * as React from 'react';

import { WavesAuthCard } from './WavesAuthCard';
import { WavesAuthInfo } from './WavesAuthInfo';
import { TxFooter, TxHeader } from '../BaseTransaction';

export function WavesAuth(props) {
  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.wavesAuthTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <WavesAuthCard {...props} />
        </div>

        <WavesAuthInfo message={message} assets={assets} />
      </div>

      <TxFooter {...props} />
    </div>
  );
}
