import * as styles from './assetScript.styl';
import * as React from 'react'
import { AssetScriptCard } from './AssetScriptCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

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
                    <TxInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
