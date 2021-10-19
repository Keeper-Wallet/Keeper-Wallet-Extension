import { TransactionWallet } from '../wallets';
import * as styles from './../pages/styles/transactions.styl';
import { OriginWarning } from './OriginWarning';
import * as React from 'react';

export const TransactionHeader = ({ selectedAccount, selectAccount, message, hideButton = false }) => {
    return (
        <div className={styles.txHeader}>
            <div className="margin-main margin-main-top flex basic500">
                <OriginWarning message={message} />
            </div>

            <TransactionWallet
                type="clean"
                account={selectedAccount}
                hideButton={hideButton}
                onSelect={selectAccount}
            />
        </div>
    );
};
