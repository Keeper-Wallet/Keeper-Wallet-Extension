import * as React from 'react';
import { TxStatus } from '../BaseTransaction';

export function AuthFinal(props) {
    return (
        <TxStatus
            {...props}
            messages={{ send: 'sign.authConfirmed', approve: 'sign.authConfirmed', reject: 'sign.authRejected' }}
        />
    );
}
