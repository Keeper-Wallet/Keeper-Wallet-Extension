import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance } from '../../ui';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { getMoney } from '../../../utils/converters';
import { getAmount } from './parseTx';

@translate(I18N_NAME_SPACE)
export class MassTransferFinal extends React.PureComponent {
    
    readonly props;
    
    render() {
        const { isApprove, isReject, isSend, message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        
        if (isApprove) {
            return <div>
                <div className="margin-main headline2">
                    {isSend ? <Trans i18nKey='sign.transactionSend'>Your transaction is confirmed!</Trans> : null}
                    {!isSend ? <Trans i18nKey='sign.transactionConfirmed'>Your transaction has been signed!</Trans>: null}
                </div>
                <div className="basic500">
                    <span>
                        {isSend ? <Trans i18nKey='sign.transactionSendMassTransfer'>You have sent</Trans>: null}
                        {!isSend ? <Trans i18nKey='sign.transactionConfirmMassTransfer'>You have approved a Mass Transfer transaction for</Trans> : null}
                        <Balance balance={getMoney(getAmount(tx), assets)} isShortFormat={true} showAsset={true}/>
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
