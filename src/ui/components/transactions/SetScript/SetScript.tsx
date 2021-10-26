import * as styles from './setScript.styl';
import * as React from 'react';

import { SetScriptCard } from './SetScriptCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function SetScript(props) {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.setScriptTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <SetScriptCard {...props} />
                </div>

                <TxDetailTabs>
                    <TxInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
}
