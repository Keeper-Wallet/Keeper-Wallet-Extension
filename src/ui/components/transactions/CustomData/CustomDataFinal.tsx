import * as React from 'react';
import { TransactionStatus } from '../TransactionStatus';

export const CustomDataFinal = (props) => {
    return (
        <TransactionStatus
            {...props}
            messages={{
                send: 'sign.customDataSent',
                approve: 'sign.customDataConfirmed',
                reject: 'sign.customDataFailed',
            }}
        />
    );
};
