import * as React from 'react';
import { TxStatus } from '../BaseTransaction';

export function WavesAuthFinal(props) {
    return (
        <TxStatus
            {...props}
            messages={{
                send: 'sign.wavesAuthConfirmed',
                approve: 'sign.wavesAuthConfirmed',
                reject: 'sign.authRejected',
            }}
        />
    );
}
