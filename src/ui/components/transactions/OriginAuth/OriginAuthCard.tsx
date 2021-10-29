import * as styles from './originAuth.styl';
import * as React from 'react';
import cn from 'classnames';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import { messageType } from './parseTx';

interface IProps {
    className: string;
    collapsed: boolean;
    message: any;
}

export class OriginAuthCard extends React.PureComponent<IProps> {
    render() {
        const { message, collapsed } = this.props;
        const { origin } = message;
        const className = cn(styles.originAuthTransactionCard, this.props.className);

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    {collapsed ? (
                        <React.Fragment>
                            <div className={styles.smallCardContent}>
                                <div className={styles.originAuthTxIconSmall}>
                                    <TxIcon txType={messageType} small={true} />
                                </div>
                                <div>
                                    <div className="basic500 body3 margin-min origin-ellipsis">{origin}</div>
                                    <h1 className="headline1">
                                        <Trans i18nKey="transactions.allowAccessTitle" />
                                    </h1>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : (
                        <div className={styles.originAuthTxIcon}>
                            <TxIcon txType={messageType} />
                        </div>
                    )}
                </div>
                {collapsed ? null : <div className={styles.cardContent} />}
            </div>
        );
    }
}
