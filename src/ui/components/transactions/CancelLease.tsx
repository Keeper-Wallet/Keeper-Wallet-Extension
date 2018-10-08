import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance, Button, BUTTON_TYPE } from '../ui';
import { SignClass } from './SignClass';
import { TxIcon } from './TransactionIcon';

@translate('extension')
export class CancelLease extends SignClass {

    render() {
        const { data: tx } = this.props.signData;
        
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>
            
                <div className={`${styles.txIcon} margin-main`}>
                    <TxIcon txType={this.props.txType}/>
                </div>

                
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.leaseTx'>Leasing TX</Trans>
                    </div>
                    <div className={styles.txValue}>{tx.leaseId}</div>
                </div>
            
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txid'>TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{this.state.txId}</div>
                </div>
            
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.fee'>Fee</Trans>
                    </div>
                    <div className={styles.txValue}><Balance isShortFormat={true} balance={tx.fee} showAsset={true}/></div>
                </div>
            </div>
        
            <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
                <Button onClick={this.rejectHandler} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <Button onClick={this.approveHandler} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.approve'>Approve</Trans>
                </Button>
            </div>
        </div>
    }
}

