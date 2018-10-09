import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react';
import {Trans} from 'react-i18next';

export const OriginWarning = ({ message }) => {
    return <div className={`${styles.originWarning} basic500 tag1`}>
        <div>{message.origin}</div>
        <div>
            <Trans i18nKey='transactions.originWarning'>wants to access your Waves Address</Trans>
        </div>
    </div>
};
