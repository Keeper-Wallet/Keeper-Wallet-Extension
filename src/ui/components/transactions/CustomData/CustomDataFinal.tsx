import * as React from 'react';
import { TxStatus } from '../BaseTransaction';
import { useTranslation } from 'react-i18next';

export function CustomDataFinal(props) {
    const { t } = useTranslation();

    return (
        <TxStatus
            {...props}
            messages={{
                send: t('sign.customDataSent'),
                approve: t('sign.customDataConfirmed'),
                reject: t('sign.customDataFailed'),
            }}
        />
    );
}
