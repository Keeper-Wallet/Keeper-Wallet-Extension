import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance } from '../ui';

@translate('extension')
export class AuthFinal extends React.PureComponent {
    
    readonly props;
    
    render() {
        const { tx, isApprove, isReject, isSend } = this.props;
        
        if (isApprove) {
            return <div>
                <div className="margin-main-large headline2">
                    {isSend ? <Trans i18nKey='sign.authConfirmed'>Your auth is confirmed and sended!</Trans> : null}
                    {!isSend ? <Trans i18nKey='sign.authConfirmed'>Your auth is confirmed!</Trans>: null}
                </div>
                <div className="basic500">
                </div>
            </div>
        }
        
        if (isReject) {
            return <div className="margin-main-large headline2">
                <Trans i18nKey='sign.authRejected'>Your Auth is rejected!</Trans>
            </div>
        }
        
        return null;
    }
}
