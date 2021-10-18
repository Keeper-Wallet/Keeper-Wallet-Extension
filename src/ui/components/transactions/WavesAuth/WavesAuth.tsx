import * as styles from './wavesAuth.styl';
import * as React from 'react';

import { WavesAuthCard } from './WavesAuthCard';
import { WavesAuthInfo } from './WavesAuthInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';

export const WavesAuth = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.wavesAuthTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <WavesAuthCard {...props} />
                </div>

                <WavesAuthInfo message={message} assets={assets} />
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
