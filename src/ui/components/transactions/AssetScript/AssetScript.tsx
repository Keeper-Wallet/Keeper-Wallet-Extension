import * as styles from './index.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';

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

                <div className="font600 tag1 basic500 margin-min">
                    <Trans i18nKey="transactions.assetScriptWarningHeader">
                        Warning: actions can block transactions with your asset
                    </Trans>
                </div>

                <div className="tag1 basic500 margin-main">
                    <Trans i18nKey="transactions.assetScriptWarningDescription">
                        We do not recommend you submit script transactions unless you are an experienced user.
                    </Trans>
                </div>

                <TransactionDetails>
                    <AssetScriptInfo message={message} assets={assets} />
                </TransactionDetails>
            </div>

            <TransactionFooter {...props} />
        </div>
    );
};
