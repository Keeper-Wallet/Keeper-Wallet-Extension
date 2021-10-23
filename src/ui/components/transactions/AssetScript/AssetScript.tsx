import * as styles from './index.styl';
import * as React from 'react';

import { AssetScriptCard } from './AssetScriptCard';
import { AssetScriptInfo } from './AssetScriptInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const AssetScript = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.assetScriptTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <AssetScriptCard {...props} />
                </div>

                <TxDetailTabs>
                    <AssetScriptInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
