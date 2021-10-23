import * as styles from './scriptInvocation.styl';
import * as React from 'react';

import { ScriptInvocationCard } from './ScriptInvocationCard';
import { ScriptInvocationInfo } from './ScriptInvocationInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const ScriptInvocation = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.scriptInvocationTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <ScriptInvocationCard {...props} />
                </div>

                <TxDetailTabs>
                    <ScriptInvocationInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
