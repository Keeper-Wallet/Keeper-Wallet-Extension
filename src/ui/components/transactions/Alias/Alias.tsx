import * as styles from './alias.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance, DateFormat } from '../../ui';
import { SignClass } from '../SignClass';
import { AliasCard } from './AliasCard';
import { TransactionBottom } from '../TransactionBottom';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';


@translate(I18N_NAME_SPACE)
export class Alias extends SignClass {
    
    render() {
        const { data: tx } = this.props.signData;
        
        return <div className={styles.transaction}>
            <div className={`${styles.aliasTxScrollBox} transactionContent`}>

                <div className="margin-main margin-main-top headline3 basic500">
                    <Trans i18nKey='transactions.confirmationRequest'>Confirmation request</Trans>
                </div>

                <div className="margin-main">
                    <AliasCard {...this.props}/>
                </div>
                
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txid'>TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{this.props.txHash}</div>
                </div>
                
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.fee'>Fee</Trans>
                    </div>
                    <div className={styles.txValue}>
                        <Balance isShortFormat={true} balance={tx.fee} showAsset={true}/>
                    </div>
                </div>
    
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txTime'>TX Time</Trans>
                    </div>
                    <div className={styles.txValue}><DateFormat value={tx.timestamp}/></div>
                </div>
            </div>
            
            <TransactionBottom {...this.props}>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount}/>
            </TransactionBottom>
            
        </div>
    }
}
