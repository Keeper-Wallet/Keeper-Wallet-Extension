import './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
export class MatcherFinal extends React.PureComponent {
    
    readonly props;
    
    render() {
        const { tx, isApprove, isReject, isSend } = this.props;

        if (isApprove) {
            return <div>
                <div className="margin-main headline2">
                    {isSend ? <Trans i18nKey='sign.matcherSend'>Sign a request to the matcher!</Trans> : null}
                    {!isSend ? <Trans i18nKey='sign.matcherConfirmed'>Sign a request to the matcher!</Trans>: null}
                </div>
            </div>
        }

        if (isReject) {
            return <div className="margin-main-large headline2">
                <Trans i18nKey='sign.matcherRejected'>Request has not been signed</Trans>
            </div>
        }

        return null;
    }
}
