import * as styles from './burn.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { BurnCard } from './BurnCard';
import { BurnInfo } from './BurnInfo';
import { TransactionBottom } from '../TransactionBottom';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';

@translate(I18N_NAME_SPACE)
export class Burn extends SignClass {
    
    render() {
        const { message, assets } = this.props;
        
        return <div className={styles.transaction}>
            <div className={`${styles.burnTxScrollBox} transactionContent`}>

                <div className="margin-main margin-main-top headline3 basic500">
                    <Trans i18nKey='transactions.confirmationRequest'>Confirmation request</Trans>
                </div>

                <div className="margin-main">
                    <BurnCard {...this.props}/>
                </div>
                
                <BurnInfo message={message} assets={assets}/>
            </div>
            
            <TransactionBottom {...this.props}>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount}/>
            </TransactionBottom>
            
        </div>
    }
}
