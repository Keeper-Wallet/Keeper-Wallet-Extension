import * as React from 'react';
import { Trans } from 'react-i18next';

export class SponsorshipFinal extends React.PureComponent {
    readonly props;

    render() {
        const { isApprove, isReject, isSend } = this.props;

        if (isApprove) {
            return (
                <div>
                    <div className="headline2 center">
                        {isSend ? <Trans i18nKey="sign.transactionSend">Your transaction is confirmed!</Trans> : null}
                        {!isSend ? (
                            <Trans i18nKey="sign.transactionConfirmed">Your transaction has been signed!</Trans>
                        ) : null}
                    </div>
                </div>
            );
        }

        if (isReject) {
            return (
                <div className="headline2 center">
                    <Trans i18nKey="sign.transactionFiled">Your transaction is rejected!</Trans>
                </div>
            );
        }

        return null;
    }
}
