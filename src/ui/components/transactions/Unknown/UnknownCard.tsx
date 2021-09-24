import * as styles from './unknown.styl';
import * as React from 'react';
import * as cn from 'classnames';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import { messageType } from './parseTx';

export class UnknownCard extends React.PureComponent<IUnknown> {
    render() {
        const { message } = this.props;
        const { origin } = message;
        const className = cn(styles.unknownTransactionCard, this.props.className, {
            [styles.authCard_collapsed]: this.props.collapsed,
        });

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.unknownTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                </div>

                <div className={styles.cardContent}>
                    <div className={styles.unknownOriginAddress}>{origin}</div>
                    <div className={styles.unknownOriginDescription}>
                        <Trans i18nKey="transactions.originWarning">wants to access your Waves Address</Trans>
                    </div>
                </div>
            </div>
        );
    }
}

interface IUnknown {
    className: string;
    collapsed: boolean;
    message: any;
}
