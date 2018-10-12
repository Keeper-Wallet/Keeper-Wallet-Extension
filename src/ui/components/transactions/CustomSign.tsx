import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from './SignClass';
import { TransactionBottom } from './TransactionBottom';

@translate('extension')
export class CustomSign extends SignClass {

    render() {
        const { data: tx } = this.props.signData;
        
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>
            
                <div className={`${styles.txIcon} margin-main`}>
                    <Trans i18nKey='transactions.customTypeTitle'>Custom Sign</Trans>
                </div>
            
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txid'>TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{this.props.txHash}</div>
                </div>
            </div>
    
            <TransactionBottom {...this.props}/>
        </div>
    }
}
