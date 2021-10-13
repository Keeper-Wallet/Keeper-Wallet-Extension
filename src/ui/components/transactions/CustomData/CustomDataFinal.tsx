import * as React from 'react';
import { Trans } from 'react-i18next';

export class CustomDataFinal extends React.PureComponent {
    readonly props;

    render() {
        const { isApprove, isReject, isSend } = this.props;

        if (isApprove) {
            return (
                <div>
                    <div className="headline2 center">
                        {isSend ? <Trans i18nKey="sign.customDataSent">Your data is confirmed!</Trans> : null}
                        {!isSend ? <Trans i18nKey="sign.customDataConfirmed">Your data has been signed!</Trans> : null}
                    </div>
                </div>
            );
        }

        if (isReject) {
            return (
                <div className="headline2 center">
                    <Trans i18nKey="sign.customDataFiled">Your data is rejected!</Trans>
                </div>
            );
        }

        return null;
    }
}
