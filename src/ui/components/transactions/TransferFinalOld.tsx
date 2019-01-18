import './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance } from '../ui';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
export class TransferFinalOld extends React.PureComponent {

    readonly props;
    
    render() {
        const { tx, isApprove, isReject, isSend } = this.props;
        
        if (isApprove) {
            return <div>
                <div className="margin-main headline2">
                    {isSend ? <Trans i18nKey='sign.transactionSend'>Your transaction is send!</Trans> : null}
                    {!isSend ? <Trans i18nKey='sign.transactionConfirmed'>Your transaction is confirmed!</Trans>: null}
                </div>
                <div className="basic500">
                    <span>
                        {isSend ? <Trans i18nKey='sign.transactionSendTransfer'>You have sent</Trans> : null}
                        {!isSend ? <Trans i18nKey='sign.transactionConfirmTransfer'>You have approved a Send transaction for</Trans> : null}
                        <Balance split={false} showAsset={true} balance={tx.data.amount}/>
                    </span>
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
