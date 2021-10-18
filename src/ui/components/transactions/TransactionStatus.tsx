import * as React from 'react';
import { Trans } from 'react-i18next';

export const TransactionStatus = ({ isApprove, isReject, isSend, messages }: IProps) => {
    if (isApprove) {
        return (
            <div className="headline2 center">
                {isSend ? (
                    <Trans i18nKey={messages?.send || 'sign.transactionSend'}>Your transaction is confirmed!</Trans>
                ) : (
                    <Trans i18nKey={messages?.approve || 'sign.transactionConfirmed'}>
                        Your transaction has been signed!
                    </Trans>
                )}
            </div>
        );
    }

    if (isReject) {
        return (
            <div className="headline2 center">
                <Trans i18nKey={messages?.reject || 'sign.transactionFailed'}>Your transaction is rejected!</Trans>
            </div>
        );
    }

    return null;
};

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
