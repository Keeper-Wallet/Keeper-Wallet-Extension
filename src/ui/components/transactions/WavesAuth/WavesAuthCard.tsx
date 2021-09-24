import * as styles from './wavesAuth.styl';
import * as React from 'react';
import * as cn from 'classnames';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';

export class WavesAuthCard extends React.PureComponent<IWavesAth> {
    render() {
        const { message, collapsed } = this.props;
        const { data, origin } = message;
        const tx = { type: data.type, ...data.data };
        const className = cn(styles.wavesAuthTransactionCard, this.props.className, {
            [styles.wavesAuthCard_collapsed]: this.props.collapsed,
        });

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    {collapsed ? (
                        <React.Fragment>
                            <div className={styles.smallCardContent}>
                                <div className={styles.wavesAuthTxIconSmall}>
                                    <TxIcon txType={'authOrigin'} small={true} />
                                </div>
                                <div>
                                    <div className="basic500 body3 margin-min origin-ellipsis">{origin}</div>
                                    <h1 className="headline1">
                                        <Trans i18nKey="transactions.signRequesWavesAuth">
                                            Sign a waves auth request
                                        </Trans>
                                    </h1>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : (
                        <div className={styles.wavesAuthTxIcon}>
                            <TxIcon txType={'authOrigin'} />
                        </div>
                    )}
                </div>
                {collapsed ? null : (
                    <div className={styles.cardContent}>
                        <div className={styles.wavesAuthOriginAddress}>{origin}</div>
                        <div className={styles.wavesAuthOriginDescription}>
                            <Trans i18nKey="transactions.originWarning">wants to access your Waves Address</Trans>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

interface IWavesAth {
    className: string;
    collapsed: boolean;

    message: any;
}
