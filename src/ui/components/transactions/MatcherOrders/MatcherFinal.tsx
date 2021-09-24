import * as React from 'react';
import { Trans } from 'react-i18next';

export class MatcherFinal extends React.PureComponent {
    readonly props;

    render() {
        const { message, isApprove, isReject, isSend } = this.props;

        if (isApprove) {
            return (
                <div>
                    <div className="margin-main headline2">
                        {isSend ? <Trans i18nKey="sign.matcherSend">Sign a request to the matcher!</Trans> : null}
                        {!isSend ? <Trans i18nKey="sign.matcherConfirmed">Sign a request to the matcher!</Trans> : null}
                    </div>
                </div>
            );
        }

        if (isReject) {
            return (
                <div className="margin-main-large headline2">
                    <Trans i18nKey="sign.authRejected">Request has not been signed</Trans>
                </div>
            );
        }

        return null;
    }
}
