import * as React from 'react';
import { TransactionStatus } from '../TransactionStatus';

export const AuthFinal = (props) => {
    return (
        <TransactionStatus
            {...props}
            messages={{ send: 'sign.authConfirmed', approve: 'sign.authConfirmed', reject: 'sign.authRejected' }}
        />
    );
};
