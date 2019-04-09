import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react';
import {Trans} from 'react-i18next';

export class OriginWarning extends React.PureComponent<{ message: any }> {
    
    render(): React.ReactNode {
        const { message } = this.props;
        if (!message.origin) {
            return null;
        }
        return <React.Fragment>
            <div className={styles.originAddress}>{message.origin}</div>
            <div className={styles.originDescription}>
                <Trans i18nKey='transactions.originWarning'>wants to access your Waves Address</Trans>
            </div>
        </React.Fragment>
    }
    
}
