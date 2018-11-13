import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance } from '../ui';

@translate('extension')
export class MatcherFinal extends React.PureComponent {
    
    readonly props;
    
    render() {
        const { tx, isApprove, isReject, isSend } = this.props;

        if (isApprove) {
            return <div>
                <div className="margin-main headline2">
                    {isSend ? <Trans i18nKey='sign.authSend'>Sign a request to the matcher!</Trans> : null}
                    {!isSend ? <Trans i18nKey='sign.authConfirmed'>Sign a request to the matcher!</Trans>: null}
                </div>
            </div>
        }

        if (isReject) {
            return <div className="margin-main-large headline2">
                <Trans i18nKey='sign.authRejected'>Request has not been signed</Trans>
            </div>
        }

        return null;
    }
}
