import * as styles from './wavesAuth.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { WavesAuthCard } from './WavesAuthCard';
import { WavesAuthInfo } from './WavesAuthInfo';
import { TransactionWallet } from '../../wallets';
import { TransactionBottom } from '../TransactionBottom';

export class WavesAuth extends SignClass {
    render() {
        const { message, assets } = this.props;

        return (
            <div className={styles.transaction}>
                <div className={`${styles.wavesAuthTxScrollBox} transactionContent`}>
                    <div className="margin-main margin-main-top headline3 basic500">
                        <Trans i18nKey="transactions.signWavesAuthRequest">Sign a waves auth request</Trans>
                    </div>

                    <div className="margin-main">
                        <WavesAuthCard {...this.props} />
                    </div>

                    <WavesAuthInfo message={message} assets={assets} />
                </div>

                <TransactionBottom {...this.props}>
                    <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount} />
                </TransactionBottom>
            </div>
        );
    }
}
