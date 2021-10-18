import * as React from 'react';
import { FinalStatus } from '../FinalStatus';

export const UnknownFinal = (props) => {
    return (
        <FinalStatus
            {...props}
            messages={{ send: 'sign.authConfirmed', approve: 'sign.authConfirmed', reject: 'sign.authRejected' }}
        />
    );
};
