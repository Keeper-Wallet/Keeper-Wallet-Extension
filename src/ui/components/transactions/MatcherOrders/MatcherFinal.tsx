import * as React from 'react';
import { TransactionStatus } from '../TransactionStatus';

export const MatcherFinal = (props) => {
    return (
        <TransactionStatus
            {...props}
            messages={{ send: 'sign.matcherSend', approve: 'sign.matcherConfirmed', reject: 'sign.matcherRejected' }}
        />
    );
};
