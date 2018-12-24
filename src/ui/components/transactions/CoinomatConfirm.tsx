import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from './SignClass';
import { TxIcon } from './TransactionIcon';
import { TransactionBottom } from './TransactionBottom';
import { I18N_NAME_SPACE } from '../../appConfig';
import { DateFormat } from '../ui';

@translate(I18N_NAME_SPACE)
export class CoinomatConfirm extends SignClass {

    render() {
        const { data: tx } = this.props.signData;
        
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>
            
                <div className={`${styles.txIcon} ${styles.txIconBig} margin-main`}>
                    <TxIcon txType={this.props.txType}/>
                </div>

                <div className="headline2 center margin-main-large">
                    <Trans i18nKey='transactions.signToCoinomat'>Sign a request to the Coinomat</Trans>
                </div>
    
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txTime'>TX Time</Trans>
                    </div>
                    <div className={styles.txValue}><DateFormat value={tx.timestamp * 1000}/></div>
                </div>
                
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.dataHash'>Data Hash</Trans>
                    </div>
                    <div className={styles.txValue}>{this.props.txHash}</div>
                </div>
            </div>
    
            <TransactionBottom {...this.props}/>
        </div>
    }
}
