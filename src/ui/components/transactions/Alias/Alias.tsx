import * as styles from './alias.styl';
import * as React from 'react';

import { AliasCard } from './AliasCard';
import { AliasInfo } from './AliasInfo';
import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';

export const Alias = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.aliasTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <AliasCard {...props} />
                </div>

                <TxDetailTabs>
                    <AliasInfo message={message} assets={assets} />
                </TxDetailTabs>
            </div>

            <TxFooter {...props} />
        </div>
    );
};
