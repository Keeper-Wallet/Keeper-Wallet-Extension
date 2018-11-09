import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance } from '../ui';
import { SignClass } from './SignClass';
import { TxIcon } from './TransactionIcon';
import { TransactionBottom } from './TransactionBottom';

@translate('extension')
export class Transfer extends SignClass {

    render() {
        const {data: tx} = this.props.signData;

        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>

                <div className={`${styles.txIcon} margin-main`}>
                    <TxIcon txType={this.props.txType}/>
                </div>

                <div className={`${styles.txBalance} center headline2`}>
                    <Balance split={true} addSign='- ' showAsset={true} balance={tx.amount}/>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.sendTo'>Send to</Trans>
                    </div>
                    <div className={styles.txValue}>{tx.recipient}</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txid'>TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{this.props.txHash}</div>
                </div>
    
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.assetId'>AssetId</Trans>
                    </div>
                    <div className={styles.txValue}>{tx.amount.asset.id}</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.fee'>Fee</Trans>
                    </div>
                    <div className={styles.txValue}><Balance isShortFormat={true} balance={tx.fee} showAsset={true}/></div>
                </div>
            </div>
    
            <TransactionBottom {...this.props}/>
        </div>
    }
}
