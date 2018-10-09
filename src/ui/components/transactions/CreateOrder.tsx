import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance, Button, BUTTON_TYPE, DateFormat } from '../ui';
import { SignClass } from './SignClass';
import { Asset, Money, BigNumber } from '@waves/data-entities';
import { TxIcon } from './TransactionIcon';
import {connect} from 'react-redux';
import { OriginWarning } from './OriginWarning';

@translate('extension')
class CreateOrderComponent extends SignClass {

    render() {
        const { amountAsset, feeAsset, priceAsset, tx } = this.state;
        
        const amount = new Money(0, new Asset(amountAsset)).cloneWithTokens(tx.amount);
        const price = new Money(0, new Asset(priceAsset)).cloneWithTokens(tx.price);
        const fee = new Money(0, new Asset(feeAsset)).cloneWithTokens(tx.matcherFee);
        const orderType = ['sell', 'buy'].includes(tx.orderType) ? tx.orderType : 'n/a';
        
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>
            
                <div className={`${styles.txIcon} margin-main`}>
                    <TxIcon txType={this.props.txType}/>
                </div>
    
                <div className={`${styles.txBalance} center headline2`}>
                    <Balance split={true} showAsset={true} balance={amount}/>
                </div>
                
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.orderType'>Order Type</Trans>
                    </div>
                    <div className={styles.txValue}>
                        <Trans i18nKey={`transactions.order_${orderType}`}>{orderType}</Trans>
                    </div>
                </div>
    
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.orderExpiration'>Order Expiration</Trans>
                    </div>
                    <div className={styles.txValue}>
                        <DateFormat value={tx.expiration}/>
                    </div>
                </div>
                
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.orderPrice'>Price</Trans>
                    </div>
                    <div className={styles.txValue}><Balance isShortFormat={true} showAsset={true} balance={price}/></div>
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
                    <div className={styles.txValue}><Balance isShortFormat={true} balance={fee} showAsset={true}/></div>
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
        const tx = props.signData.data;
        const feeAsset = props.assets['WAVES'];
        const amountAsset = props.assets[tx.amountAsset];
        const priceAsset = props.assets[tx.priceAsset];
        return { amountAsset, feeAsset, priceAsset, tx };
    }
}


const mapPropsToState = ({ assets }) => {
    return {
        assets,
    };
};

export const CreateOrder = connect(mapPropsToState)(CreateOrderComponent);
