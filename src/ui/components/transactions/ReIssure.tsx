import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance } from '../ui';
import { SignClass } from './SignClass';
import { TxIcon } from './TransactionIcon';
import {connect} from 'react-redux';
import { TransactionBottom } from './TransactionBottom';

@translate('extension')
export class ReIssureComponent extends SignClass {

    render() {
        const { data: tx } = this.props.signData;
        const asset = this.state.asset;
        const quantity = tx.quantity;
    
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>
            
                <div className={`${styles.txIcon} margin-main`}>
                    <TxIcon txType={this.props.txType}/>
                </div>
            
                <div className={`${styles.txBalance} center headline2`}>
                    <Balance addSign="+" split={true} showAsset={true} balance={quantity}/>
                </div>
    
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.assetId'>Asset ID</Trans>
                    </div>
                    <div className={styles.txValue}>{asset.id}</div>
                </div>
                
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.issureType'>Type</Trans>
                    </div>
                    <div className={styles.txValue}>{
                        tx.reissuable ?
                            <Trans i18nKey='transactions.reissuable'>Reissuable</Trans>:
                            <Trans i18nKey='transactions.noReissuable'>Not reissuable</Trans>
                    }</div>
                </div>
    
                { asset.description ? <div className={`${styles.txRow} ${styles.txRowDescription}`}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.description'>Description</Trans>
                    </div>
                    <div className={`${styles.txValue} plate fullwidth`}>{asset.description}</div>
                </div> : null }

                <div className={`${styles.txRow} ${styles.txRowDescription}`}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txid'>TXID</Trans>
                    </div>
                    <div className={`${styles.txValue} plate fullwidth`}>{this.props.txHash}</div>
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
    
    static getDerivedStateFromProps(props) {
       const asset = props.assets[props.signData.data.assetId];
       return { asset };
    }
}

const mapPropsToState = ({ assets }) => {
    return {
        assets
    };
};



export const ReIssure = connect(mapPropsToState)(ReIssureComponent as any);
