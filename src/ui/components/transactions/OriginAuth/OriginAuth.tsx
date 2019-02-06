import * as styles from './originAuth.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { OriginAuthCard } from './OriginAuthCard';
import { OriginAuthInfo } from './OriginAuthInfo';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';
import { ApproveBtn, Button, BUTTON_TYPE } from '../../ui/buttons';

@translate(I18N_NAME_SPACE)
export class OriginAuth extends SignClass {
    
    render() {
        const { message, assets } = this.props;
    
        return <div className={styles.transaction}>
            <div className={`${styles.originAuthTxScrollBox} transactionContent`}>

                <div className="margin-main margin-main-top headline3 basic500">
                    <Trans i18nKey='transactions.allowAccess'>Allow access</Trans>
                </div>

                <div className="margin-main">
                    <OriginAuthCard {...this.props}/>
                </div>
                
                <OriginAuthInfo message={message} assets={assets}/>
            </div>
    
            <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
                <Button onClick={this.props.reject} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <ApproveBtn onClick={this.props.approve} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.auth'>Auth</Trans>
                </ApproveBtn>
    
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount}/>
            </div>
        </div>
    }
}
