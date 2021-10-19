import * as styles from './index.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import cn from 'classnames';
import { Balance, ShowScript } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';

export class IssueCard extends React.PureComponent<IIssue> {
    render() {
        const className = cn(styles.issueTransactionCard, this.props.className, {
            [styles.issueCard_collapsed]: this.props.collapsed,
        });

        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx), assets);

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.issueTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            {!tx.reissuable && !tx.decimals && tx.quantity == 1 ? (
                                !tx.script ? (
                                    <Trans i18nKey="transactions.issueNFT" />
                                ) : (
                                    <Trans i18nKey="transactions.issueSmartNFT" />
                                )
                            ) : !tx.script ? (
                                <Trans i18nKey="transactions.issueToken" />
                            ) : (
                                <Trans i18nKey="transactions.issueSmartToken" />
                            )}
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
                    {tx.description ? (
                        <div className={styles.txRow}>
                            <div className="tx-title tag1 basic500">
                                <Trans i18nKey="transactions.description">Description</Trans>
                            </div>
                            <div className={styles.txValue}>{tx.description}</div>
                        </div>
                    ) : null}

                    <div className={styles.txRow}>
                        <div className="tx-title tag1 basic500">
                            <Trans i18nKey="transactions.issureType">Type</Trans>
                        </div>
                        <div className={styles.txValue}>
                            {tx.reissuable ? (
                                <Trans i18nKey="transactions.reissuable">Reissuable</Trans>
                            ) : (
                                <Trans i18nKey="transactions.noReissuable">Not reissuable</Trans>
                            )}
                        </div>
                    </div>

                    <div className={styles.txRow}>
                        <div className="tx-title tag1 basic500">
                            <Trans i18nKey="transactions.script">Script</Trans>
                        </div>
                        <div className={styles.txValue}>
                            <ShowScript
                                script={tx.script}
                                showNotify={true}
                                optional={true}
                                hideScript={this.props.collapsed}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

interface IIssue {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}
