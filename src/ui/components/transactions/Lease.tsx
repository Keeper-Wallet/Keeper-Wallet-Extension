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
export class LeaseComponent extends SignClass {

    render() {
        const { tx, asset } = this.state;
        const amount = new Money(tx.amount, new Asset(asset));
    
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
                        <Trans i18nKey='transactions.to'>To</Trans>
                    </div>
                    <div className={styles.txValue}>{tx.recipient}</div>
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
                
                <OriginWarning {...this.props}/>
            </div>
        </div>
    }
    
    static getDerivedStateFromProps(props) {
       const asset = props.assets['WAVES'];
       return { asset,  tx: props.signData.data };
    }
}

const mapPropsToState = ({ assets }) => {
    return {
        assets,
    };
};



export const Lease = connect(mapPropsToState)(LeaseComponent as any);
