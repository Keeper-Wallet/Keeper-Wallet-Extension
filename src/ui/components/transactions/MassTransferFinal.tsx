import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance } from '../ui';

@translate('extension')
export class MassTransferFinal extends React.PureComponent {
    
    readonly props;
    
    render() {
        const { tx, isApprove, isReject, isSend } = this.props;
        
        if (isApprove) {
            return <div>
                <div className="margin-main-large headline2">
                    {isSend ? <Trans i18nKey='sign.transactionSend'>Your transaction is send!</Trans> : null}
                    {!isSend ? <Trans i18nKey='sign.transactionConfirmed'>Your transaction is confirmed!</Trans>: null}
                </div>
                <div className="basic500">
                    {isSend ? <span><Trans i18nKey='sign.transactionSendMassTransfer'>You have sent</Trans> 0.099 WAVES</span> : null} /* todo @boris - add asset and amount */
                    {!isSend ? <span><Trans i18nKey='sign.transactionConfirmMassTransfer'>You have approved a Mass Transfer transaction for</Trans> 0.099 WAVES</span> : null} /* todo @boris */
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
