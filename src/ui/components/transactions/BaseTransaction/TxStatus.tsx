import * as React from 'react';
import { Trans } from 'react-i18next';

export function TxStatus({ isApprove, isReject, isSend, messages }: IProps) {
    if (isApprove) {
        return (
            <div className="headline2 center">
                <Trans
                    i18nKey={
                        isSend
                            ? messages?.send || 'sign.transactionSend'
                            : messages?.approve || 'sign.transactionConfirmed'
                    }
                />
            </div>
        );
    }

    if (isReject) {
        return (
            <div className="headline2 center">
                <Trans i18nKey={messages?.reject || 'sign.transactionFailed'} />
            </div>
        );
    }

    return null;
}

interface IProps {
    isApprove: boolean;
    isReject: boolean;
    isSend: boolean;
    messages?: {
        approve?: string;
        reject?: string;
        send?: string;
    };
}
