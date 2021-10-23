import * as React from 'react';
import { TxStatus } from '../BaseTransaction';

export const UnknownFinal = (props) => {
    return (
        <TxStatus
            {...props}
            messages={{ send: 'sign.authConfirmed', approve: 'sign.authConfirmed', reject: 'sign.authRejected' }}
        />
    );
};
