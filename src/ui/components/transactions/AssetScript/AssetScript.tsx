import * as styles from './index.styl';
import * as React from 'react';

import { AssetScriptCard } from './AssetScriptCard';
import { AssetScriptInfo } from './AssetScriptInfo';
import { TransactionFooter } from '../TransactionFooter';
import { TransactionHeader } from '../TransactionHeader';
import { TransactionDetails } from '../TransactionDetails';

export const AssetScript = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TransactionHeader {...props} />

            <div className={`${styles.assetScriptTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <AssetScriptCard {...props} />
                </div>

                <TransactionDetails>
                    <AssetScriptInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
