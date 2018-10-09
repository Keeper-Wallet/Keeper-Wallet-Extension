import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance, Button, BUTTON_TYPE } from '../ui';
import { SignClass } from './SignClass';
import { Asset, Money, BigNumber } from '@waves/data-entities';
import { TxIcon } from './TransactionIcon';
import { OriginWarning } from './OriginWarning';

@translate('extension')
export class SponsorShip extends SignClass {
    
    render() {
        const { data: tx } = this.props.signData;
        const { minSponsoredAssetFee } = tx;
        const asset = minSponsoredAssetFee.asset;
        const zero = minSponsoredAssetFee.cloneWithTokens(0);
        const txType = minSponsoredAssetFee.gt(zero) ? 'sponsor_enable' : 'sponsor_disbale';
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>

                <div className={`${styles.txIcon} margin-main`}>
                    <TxIcon txType={txType}/>
                </div>

                <div className={`${styles.txBalance} center headline2`}>
                    <Balance split={true} showAsset={true} balance={minSponsoredAssetFee}/>
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
                
                <div>
                    <OriginWarning {...this.props}/>
                </div>
            </div>
        </div>
    }
}
