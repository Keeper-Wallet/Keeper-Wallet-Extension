import * as React from 'react';
import { TxStatus } from '../BaseTransaction';

export const CustomDataFinal = (props) => {
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
};
