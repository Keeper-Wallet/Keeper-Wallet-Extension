import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance } from '../ui';

@translate('extension')
export class LeaseFinal extends React.PureComponent {
    
    readonly props;
    
    render() {
        const { tx, isApprove, isReject, isSend } = this.props;
        
        if (isApprove) {
            return <div>
                <div className="margin-main-large headline2">
                    {isSend ? <Trans i18nKey='sign.transactionSend'>Your transaction is confirmed!</Trans> : null}
                    {!isSend ? <Trans i18nKey='sign.transactionConfirm'>Your transaction is signed</Trans> : null}
                </div>
                <div className="basic500">
                    {isSend ? <span><Trans i18nKey='sign.transactionSend.lease'>You have leased</Trans> 0.001 WAVES</span> : null} /* todo @boris - add amount of WAVES*/
                    {!isSend ? <span><Trans i18nKey='sign.transactionConfirm.lease'>Your approved transaction</Trans> 0.001 WAVES</span> : null} /* todo @boris */
                </div>
            </div>
        }
        
        if (isReject) {
            return <div className="margin-main-large headline2">
                <Trans i18nKey='sign.transactionFiled'>Your transaction is rejected!</Trans>
            </div>
        }
        
        return null;
    }
}
