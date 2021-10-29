import * as styles from './massTransfer.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Attachment, Balance, Ellipsis, PlateCollapsable } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, getTransferAmount, messageType } from './parseTx';
import { readAttachment } from '../../../utils/waves';

const MIN_COUNT = 0;
const ADDRESS_LENGTH = 35;

const Transfers = ({ transfers, totalAmount, count = MIN_COUNT }) => {
    const assets = { [totalAmount.asset.id]: totalAmount.asset };

    return transfers.slice(0, count).map(({ recipient, amount }) => {
        const money = getMoney(getTransferAmount(amount, totalAmount.asset.id), assets);
        const isAddress = recipient.length == ADDRESS_LENGTH;

        return (
            <div key={recipient} className={styles.txRow}>
                <div className={cn('body3', 'tx-title-black', styles.massTransferRecipient)} title={recipient}>
                    {isAddress ? <Ellipsis text={recipient} /> : recipient}
                </div>
                <div className={cn('body3', 'submit400', styles.massTransferAmount)}>
                    <Balance isShortFormat={true} balance={money} showAsset={false} />
                </div>
            </div>
        );
    });
};

interface IProps {
    assets: any;
    className: string;
    collapsed: boolean;
    message: any;
}

export class MassTransferCard extends React.PureComponent<IProps> {
    readonly state = Object.create(null);

    toggleShowRecipients = (count) => {
        this.setState({ count });
    };

    render() {
        const className = cn(styles.massTransferTransactionCard, this.props.className, {
            [styles.massTransferCard_collapsed]: this.props.collapsed,
        });

        const { message, assets, collapsed } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx), assets);

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.massTransferTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.massTransfer" />
                        </div>
                        <h1 className="headline1">
                            <Balance
                                split={true}
                                addSign="- "
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
                            <Trans i18nKey="transactions.recipients" />
                        </div>
                        <div className={styles.txValue}>
                            <PlateCollapsable className={styles.expandableList} showExpand={!collapsed}>
                                <Transfers transfers={tx.transfers} totalAmount={amount} count={tx.transfers.length} />
                            </PlateCollapsable>
                        </div>
                    </div>

                    {tx.attachment && tx.attachment.length ? (
                        <div className={`${styles.txRow} ${styles.txRowDescription}`}>
                            <div className="tx-title tag1 basic500">
                                <Trans i18nKey="transactions.attachment" />
                            </div>
                            <Attachment className="plate fullwidth" attachment={readAttachment(tx.attachment)} />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}
