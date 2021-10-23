import * as styles from './cancelLease.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';

export class CancelLeaseCard extends React.PureComponent<ICancelLease> {
    render() {
        const className = cn(styles.cancelLeaseTransactionCard, this.props.className, {
            [styles.cancelLeaseCard_collapsed]: this.props.collapsed,
        });

        const { message, assets } = this.props;
        const { data = {} } = message;

        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx, message), assets);

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.cancelLeaseTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.leaseCancel" />
                        </div>
                        <h1 className="headline1">
                            <Balance
                                split={true}
                                showAsset={true}
                                balance={amount}
                                className={styles.txBalanceWrapper}
                            />
                        </h1>
                    </div>
                </div>

                <div className={styles.cardContent}>
                    <div className={styles.txRow}>
                        <div className="tx-title tag1 basic500">
                            <Trans i18nKey="transactions.recipient" />
                        </div>
                        <div className={styles.txValue}>{message.lease.recipient}</div>
                    </div>
                </div>
            </div>
        );
    }
}

interface ICancelLease {
    assets: any;
    className: string;
    collapsed: boolean;
    message: any;
}
