import * as React from 'react';
import { TxStatus } from '../BaseTransaction';

export function CustomDataFinal(props) {
    return (
        <TxStatus
            {...props}
            messages={{
                send: 'sign.customDataSent',
                approve: 'sign.customDataConfirmed',
                reject: 'sign.customDataFailed',
            }}
        />
    );
}
