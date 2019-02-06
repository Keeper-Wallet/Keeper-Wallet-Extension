import * as styles from './transfer.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { TransferCard } from './TransferCard';
import { TransferInfo } from './TransferInfo';
import { TransactionBottom } from '../TransactionBottom';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';

@translate(I18N_NAME_SPACE)
export class Transfer extends SignClass {
    
    render() {
        const { message, assets } = this.props;
        
        return <div className={styles.transaction}>
            <div className={`${styles.transferTxScrollBox} transactionContent`}>

                <div className="margin-main margin-main-top headline3 basic500">
                    <Trans i18nKey='transactions.confirmationRequest'>Confirmation request</Trans>
                </div>

                <div className="margin-main">
                    <TransferCard {...this.props}/>
                </div>
                
                <TransferInfo message={message} assets={assets}/>
            </div>
            
            <TransactionBottom {...this.props}>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount}/>
            </TransactionBottom>
            
        </div>
    }
}
