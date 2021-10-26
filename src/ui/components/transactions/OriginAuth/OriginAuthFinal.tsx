import * as React from 'react';
import { TxStatus } from '../BaseTransaction';
import { useTranslation } from 'react-i18next';

export function OriginAuthFinal(props) {
    const { t } = useTranslation();

    return (
        <TxStatus
            {...props}
            messages={{
                send: t('sign.authConfirmed'),
                approve: t('sign.authConfirmed'),
                reject: t('sign.authRejected'),
            }}
        />
    );
}
