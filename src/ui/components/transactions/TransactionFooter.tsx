import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { ApproveBtn, Button, BUTTON_TYPE } from '../ui';

export const TransactionFooter = ({ message, approve, reject, hideApprove, autoClickProtection }) => {
    const isSend = message.broadcast;

    return (
        <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
            <Button onClick={reject} type={BUTTON_TYPE.WARNING}>
                <Trans i18nKey="sign.reject" />
            </Button>

            {hideApprove ? null : (
                <ApproveBtn onClick={approve} type={BUTTON_TYPE.SUBMIT} autoClickProtection={autoClickProtection}>
                    <Trans i18nKey={isSend ? 'sign.confirmButton' : 'sign.signButton'} />
                </ApproveBtn>
            )}
        </div>
    );
};
