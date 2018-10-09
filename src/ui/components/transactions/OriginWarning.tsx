import * as React from 'react';
import {Trans} from 'react-i18next';

export const OriginWarning = ({ message }) => {
    return <div>
        <div>{message.origin}</div>
        <div>
            <Trans i18nKey='transactions.originWarning'>wants to access your Waves Address</Trans>
        </div>
    </div>
};
