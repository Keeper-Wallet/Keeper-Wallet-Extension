import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import cn from 'classnames';
import { TransactionWallet } from '../wallets';
import oauth from './OriginAuth';
import { isMe as isOrder } from './CreateOrder/parseTx';

const Error = ({ approveError }) => {
    return (
        <div className={`plate ${styles.finalTxPlate} ${styles.finalTxPlateError}`}>
            <div className={`headline2Bold margin-main-big error-icon ${styles.finalTxTitle}`}>
                <Trans i18nKey="sign.someError">Something went wrong</Trans>
            </div>
            <div className={`body3 ${styles.finalTxPlate}`}>{JSON.stringify(approveError.error, null, 4)}</div>
        </div>
    );
};

export class FinalTransaction extends React.PureComponent {
    readonly props: any;

    render() {
        const {
            transactionStatus,
            selectedAccount,
            messages,
            notifications,
            message,
            onClose,
            onNext,
            onList,
            assets,
        } = this.props;

        const newMessages = messages.map((item) => item.id).filter((id) => id !== message.id).length;
        const msgCount = newMessages + notifications.length;
        const isSend = message.broadcast;
        const isApprove = !!transactionStatus.approveOk;
        const isReject = !!transactionStatus.rejectOk;
        const isError = !!transactionStatus.approveError;
        const isShowNext = newMessages > 0;
        const isShowList = msgCount > 1 || notifications.length;
        const isShowClose = !isShowNext && !isShowList;
        const config = this.props.config;
        const FinalComponent = config.final;
        const Card = config.card;
        const network = selectedAccount && selectedAccount.networkCode;
        const txLink = `https://${network === 'T' ? 'testnet.' : ''}wavesexplorer.com/tx/${message.messageHash}`;
        const className = cn(styles.txBigIcon, 'margin-main', {
            'tx-reject-icon': isReject,
            'tx-approve-icon': isApprove,
        });
        const isNotOrder = !isOrder(message.data, message.type);

        if (config.type === oauth.type && !isShowClose) {
            const method = isShowList ? 'onList' : 'onNext';
            this.props[method]();
            return null;
        }

        return (
            <div className={styles.txFinal}>
                <div className={className}></div>

                <div className={styles.txFinalContentWrapper}>
                    <div className={styles.finalTxContent}>
                        <div className="margin-main-top margin-main-big">
                            {isApprove || isReject ? (
                                <div className="center">
                                    <FinalComponent
                                        isApprove={isApprove}
                                        isReject={isReject}
                                        isSend={message.broadcast}
                                        message={message}
                                        assets={assets}
                                    />
                                </div>
                            ) : null}
                            {isError ? (
                                <div className="headline2">
                                    <Error approveError={transactionStatus.approveError} />
                                </div>
                            ) : null}
                        </div>

                        <Card message={message} assets={assets} collapsed={false} />

                        {isSend && isApprove && isNotOrder && (
                            <div className="center margin-main-big-top">
                                <a rel="noopener noreferrer" className="link black" href={txLink} target="_blank">
                                    <Trans i18nKey="sign.viewTransaction">View Transaction</Trans>
                                </a>
                            </div>
                        )}
                        {!isNotOrder && (
                            <div className={`${styles.txRow} margin-main-top`}>
                                <div className="basic500 tx-title tag1">
                                    <Trans i18nKey="transactions.orderId">Order ID</Trans>
                                </div>
                                <div className="black">{message.messageHash}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.txFinalFooterWrapper}>
                    <div className={styles.txFinalButtonWrapper}>
                        {isShowList ? (
                            <Button type={BUTTON_TYPE.SUBMIT} onClick={onList} className={styles.closeBtn}>
                                <Trans i18nKey="sign.pendingList">Pending list</Trans>
                            </Button>
                        ) : null}

                        {(isShowList && isShowClose) || (isShowNext && isShowList) ? (
                            <div className={styles.buttonMargin}></div>
                        ) : null}

                        {isShowNext ? (
                            <Button type={BUTTON_TYPE.SUBMIT} onClick={onNext} className={styles.nextBtn}>
                                <Trans i18nKey="sign.nextTransaction">Next transaction</Trans>
                            </Button>
                        ) : null}

                        {isShowClose ? (
                            <Button onClick={onClose} className={styles.closeBtn}>
                                {isError ? <Trans i18nKey="sign.understand">I understand</Trans> : null}
                                {isReject || isApprove ? <Trans i18nKey="sign.ok">Close</Trans> : null}
                            </Button>
                        ) : null}
                    </div>

                    {isSend && isApprove ? (
                        <TransactionWallet
                            className={styles.finalTxWallet}
                            account={this.props.selectedAccount}
                            hideButton={true}
                        />
                    ) : (
                        <TransactionWallet
                            className={styles.finalTxWallet}
                            account={this.props.selectedAccount}
                            hideButton={true}
                        />
                    )}
                </div>
            </div>
        );
    }
}
