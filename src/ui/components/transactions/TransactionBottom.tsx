import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import { OriginWarning } from './OriginWarning';

export const TransactionBottom = ({ message, resolve, reject }) => {
    
    const isSend = message.broadcast;
    
    return <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
        <Button onClick={resolve} type={BUTTON_TYPE.WARNING}>
            <Trans i18nKey='sign.reject'>Reject</Trans>
        </Button>
        
        <Button onClick={reject} type={BUTTON_TYPE.SUBMIT}>
            {
                isSend ?
                    <Trans i18nKey='sign.approve'>Confirm</Trans> :
                    <Trans i18nKey='sign.approve'>Sign</Trans>
            }
        </Button>
        
        <OriginWarning message={message}/>
    </div>;
};
