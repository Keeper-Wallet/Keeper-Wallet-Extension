import { TransactionWallet } from '../wallets';
import * as styles from './../pages/styles/transactions.styl';
import { OriginWarning } from './OriginWarning';
import * as React from 'react';

export const TransactionHeader = ({ selectedAccount, message }) => {
    return (
        <div className={styles.txHeader}>
            <div className="margin-main margin-main-top">
                <TransactionWallet account={selectedAccount} hideButton={true} />
            </div>

            <div className="margin-main headline3 basic500 flex">
                <OriginWarning message={message} />
            </div>
        </div>
    );
};
