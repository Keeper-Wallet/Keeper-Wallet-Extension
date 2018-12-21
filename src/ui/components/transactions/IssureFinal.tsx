import './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Asset, Money, BigNumber } from '@waves/data-entities';
import { Balance } from '../ui';
import { I18N_NAME_SPACE } from '../../appConfig';


@translate(I18N_NAME_SPACE)
export class IssureFinal extends React.PureComponent {
    
    readonly props;
    
    render() {
        const { tx, isApprove, isReject, isSend } = this.props;
    
        const asset = {
            description: tx.data.description,
            name: tx.data.name,
            precision: tx.data.precision,
            quantity: new BigNumber(tx.data.quantity),
            reissuable: false
        } as any;
    
        const quantity = new Money(asset.quantity, new Asset(asset));
        
        if (isApprove) {
            return <div>
                <div className="margin-main headline2">
                    {isSend ? <Trans i18nKey='sign.transactionSend'>Your transaction is confirmed!</Trans> : null}
                    {!isSend ? <Trans i18nKey='sign.transactionApproved'>Your transaction is signed</Trans> : null}
                </div>
                <div className="basic500">
                    <span>
                        {isSend ? <Trans i18nKey='sign.transactionSendIssure'>You have generated</Trans> : null}
                        {!isSend ? <Trans i18nKey='sign.transactionConfirmIssure'>You have approved generated</Trans> : null}
                        <Balance balance={quantity} isShortFormat={false} showAsset={true}/>
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
