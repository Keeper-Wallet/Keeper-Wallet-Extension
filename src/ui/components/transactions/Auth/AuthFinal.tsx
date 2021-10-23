import * as React from 'react';
import { TxStatus } from '../BaseTransaction';

export const AuthFinal = (props) => {
    return (
        <TxStatus
            {...props}
            messages={{ send: 'sign.authConfirmed', approve: 'sign.authConfirmed', reject: 'sign.authRejected' }}
        />
    );
};
