import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance } from '../ui';

@translate('extension')
export class ReIssureFinal extends React.PureComponent {
    
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
                    {isSend ? <span><Trans i18nKey='sign.transactionSendReIssure'>You have generated additional</Trans> {tx.data.name}</span> : null}
                    {!isSend ? <span><Trans i18nKey='sign.transactionConfirmReIssure'>You have approved additional Issuance of</Trans> <Balance showAsset={true} isShortFormat={true} balance={tx.data.quantity}/></span> : null}
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
