import * as React from 'react';
import { FinalStatus } from '../FinalStatus';

export const WavesAuthFinal = (props) => {
    return (
        <FinalStatus
            {...props}
            messages={{
                send: 'sign.wavesAuthConfirmed',
                approve: 'sign.wavesAuthConfirmed',
                reject: 'sign.authRejected',
            }}
        />
    );
};
