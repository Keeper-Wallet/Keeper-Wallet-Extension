import * as React from 'react';
import { TransactionStatus } from '../TransactionStatus';

export const WavesAuthFinal = (props) => {
    return (
        <TransactionStatus
            {...props}
            messages={{
                send: 'sign.wavesAuthConfirmed',
                approve: 'sign.wavesAuthConfirmed',
                reject: 'sign.authRejected',
            }}
        />
    );
};
