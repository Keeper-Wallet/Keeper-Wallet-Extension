import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance, Button, BUTTON_TYPE } from '../ui';
import { SignClass } from './SignClass';
import { Asset, Money, BigNumber } from '@waves/data-entities';
import { TxIcon } from './TransactionIcon';
import {connect} from 'react-redux';
import { OriginWarning } from './OriginWarning';

@translate('extension')
export class ReIssureComponent extends SignClass {

    render() {
        const { data: tx } = this.props.signData;
        const asset = this.state.asset;
    
        const quantity = new Money(tx.quantity, new Asset(asset));
    
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
                        asset.reissuable ?
                            <Trans i18nKey='transactions.reissuable'>Reissuable</Trans>:
                            <Trans i18nKey='transactions.noReissuable'>No reissuable</Trans>
                    }</div>
                </div>
                
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.description'>Description</Trans>
                    </div>
                    <div className={styles.txValue}>{asset.description}</div>
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
    
                <OriginWarning {...this.props}/>
            </div>
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
