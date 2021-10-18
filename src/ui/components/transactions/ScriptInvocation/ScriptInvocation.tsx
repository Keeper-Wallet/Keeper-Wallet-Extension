import * as styles from './scriptInvocation.styl';
import * as React from 'react';

import { ScriptInvocationCard } from './ScriptInvocationCard';
import { ScriptInvocationInfo } from './ScriptInvocationInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const ScriptInvocation = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.scriptInvocationTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <ScriptInvocationCard {...props} />
                </div>

                <TransactionDetails>
                    <ScriptInvocationInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
