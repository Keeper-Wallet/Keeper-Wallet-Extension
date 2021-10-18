import * as React from 'react';
import { FinalStatus } from '../FinalStatus';

export const CustomDataFinal = (props) => {
    return (
        <FinalStatus
            {...props}
            messages={{
                send: 'sign.customDataSent',
                approve: 'sign.customDataConfirmed',
                reject: 'sign.customDataFailed',
            }}
        />
    );
};
