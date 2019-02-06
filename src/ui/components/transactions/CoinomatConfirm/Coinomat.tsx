import * as styles from './coinomat.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { CoinomatCard } from './CoinomatCard';
import { CoinomatInfo } from './CoinomatInfo';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';
import { TransactionBottom } from '../TransactionBottom';


@translate(I18N_NAME_SPACE)
export class Coinomat extends SignClass {
    
    render() {
        const { message, assets } = this.props;
    
        return <div className={styles.transaction}>
            <div className={`${styles.coinomatTxScrollBox} transactionContent`}>

                <div className="margin-main margin-main-top headline3 basic500">
                    <Trans i18nKey='transactions.signToCoinomat'>Sign a request to the Coinomat</Trans>
                </div>

                <div className="margin-main">
                    <CoinomatCard {...this.props}/>
                </div>
                
                <CoinomatInfo message={message} assets={assets}/>
            </div>
    
            <TransactionBottom {...this.props}>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount}/>
            </TransactionBottom>
        </div>
    }
}
