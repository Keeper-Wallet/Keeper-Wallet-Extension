import * as styles from './index.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { PackageCard } from './PackageCard';
import { PackageInfo } from './PackageInfo';
import { TransactionBottom } from '../TransactionBottom';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';

@translate(I18N_NAME_SPACE)
export class Package extends SignClass {
    
    render() {
        const { message, assets } = this.props;
        const { title } = message;
        return <div className={styles.transaction}>
            <div className={`${styles.dataTxScrollBox} transactionContent`}>

                <div className="margin-main margin-main-top headline3 basic500">
                    {title ? title : <Trans i18nKey='transactions.confirmationRequest'>Confirmation request</Trans>}
                </div>

                <div className="margin-main">
                    <PackageCard {...this.props}/>
                </div>
                
                <PackageInfo message={message} assets={assets}/>
            </div>
            
            <TransactionBottom {...this.props}>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount}/>
            </TransactionBottom>
            
        </div>
    }
}
