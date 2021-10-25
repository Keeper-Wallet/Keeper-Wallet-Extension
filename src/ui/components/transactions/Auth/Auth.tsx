import * as styles from './auth.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';

import { AuthCard } from './AuthCard';
import { AuthInfo } from './AuthInfo';
import { ApproveBtn, Button, BUTTON_TYPE } from '../../ui';
import { TxHeader } from '../BaseTransaction';

export const Auth = (props) => {
    const { message, assets } = props;

    return (
        <div className={styles.transaction}>
            <TxHeader {...props} />

            <div className={`${styles.authTxScrollBox} transactionContent`}>
                <div className="margin-main">
                    <AuthCard {...props} />
                </div>

                <AuthInfo message={message} assets={assets} />
            </div>

            <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
                <Button id="reject" onClick={props.reject} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey="sign.reject" />
                </Button>
                <ApproveBtn id="approve" onClick={props.approve} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey="sign.auth" />
                </ApproveBtn>
            </div>
        </div>
    );
};
