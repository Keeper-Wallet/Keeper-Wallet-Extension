import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance, DateFormat } from '../ui';
import { SignClass } from './SignClass';
import { TxIcon } from './TransactionIcon';
import {connect} from 'react-redux';
import { TransactionBottom } from './TransactionBottom';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class CreateOrderComponent extends SignClass {

    render() {
        const { tx } = this.state;
        
        const amount =  tx.amount;
        const price = tx.price;
        const fee = tx.matcherFee;
        const orderType = ['sell', 'buy'].includes(tx.orderType) ? tx.orderType : 'n/a';
        
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>
            
                <div className={`${styles.txIcon} margin-main`}>
                    <TxIcon txType={this.props.txType}/>
                </div>
    
                <div className={`${styles.txBalance} center headline2`}>
                    <Balance split={true} showAsset={true} balance={amount} className={styles.txBalanceWrapper} />
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
    
            <TransactionBottom {...this.props}/>
        </div>
    }
    
    static getDerivedStateFromProps(props) {
        const tx = props.signData.data;
        return { tx };
    }
}


const mapPropsToState = ({ assets }) => {
    return {
        assets,
    };
};

export const CreateOrder = connect(mapPropsToState)(CreateOrderComponent);
