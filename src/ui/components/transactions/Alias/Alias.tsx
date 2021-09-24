import * as styles from './alias.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { AliasCard } from './AliasCard';
import { AliasInfo } from './AliasInfo';
import { TransactionBottom } from '../TransactionBottom';
import { TransactionWallet } from '../../wallets';

export class Alias extends SignClass {
    render() {
        const { message, assets } = this.props;

        return (
            <div className={styles.transaction}>
                <div className={`${styles.aliasTxScrollBox} transactionContent`}>
                    <div className="margin-main margin-main-top headline3 basic500">
                        <Trans i18nKey="transactions.confirmationRequest">Confirmation request</Trans>
                    </div>

                    <div className="margin-main">
                        <AliasCard {...this.props} />
                    </div>

                    <AliasInfo message={message} assets={assets} />
                </div>

                <TransactionBottom {...this.props}>
                    <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount} />
                </TransactionBottom>
            </div>
        );
    }
}
