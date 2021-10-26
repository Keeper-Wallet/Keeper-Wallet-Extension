import * as React from 'react';
import { TxStatus } from '../BaseTransaction';

export function MatcherFinal(props) {
    return (
        <TxStatus
            {...props}
            messages={{ send: 'sign.matcherSend', approve: 'sign.matcherConfirmed', reject: 'sign.matcherRejected' }}
        />
    );
}
