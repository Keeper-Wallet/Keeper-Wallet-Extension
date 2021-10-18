import * as React from 'react';
import { FinalStatus } from '../FinalStatus';

export const MatcherFinal = (props) => {
    return (
        <FinalStatus
            {...props}
            messages={{ send: 'sign.matcherSend', approve: 'sign.matcherConfirmed', reject: 'sign.matcherRejected' }}
        />
    );
};
