import * as styles from './index.styl';
import * as React from 'react';

import { SetScriptCard } from './SetScriptCard';
import { SetScriptInfo } from './SetScriptInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const SetScript = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.setScriptTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <SetScriptCard {...props} />
                </div>

                <TransactionDetails>
                    <SetScriptInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
