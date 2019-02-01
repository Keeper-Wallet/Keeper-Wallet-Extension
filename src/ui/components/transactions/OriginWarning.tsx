import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react';
import {Trans} from 'react-i18next';

export const OriginWarning = ({ message }) => {
    if (!message.origin) {
        return null;
    }
    return <div>
        <a href={`http://${message.origin}`} target="_blank" className={styles.originAddress}>{message.origin}</a>
        <div className={styles.originDescription}>
            <Trans i18nKey='transactions.originWarning'>wants to access your Waves Address</Trans>
        </div>
    </div>
};
