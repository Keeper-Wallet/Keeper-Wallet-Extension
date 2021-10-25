import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import cn from 'classnames';
import oauth from './OriginAuth';
import { isMe as isOrder } from './CreateOrder/parseTx';
import { TxHeader } from './BaseTransaction';

const Error = ({ approveError }) => {
    return (
        <div className={`plate ${styles.finalTxPlate} ${styles.finalTxPlateError}`}>
            <div className={`headline2Bold margin-main-big error-icon ${styles.finalTxTitle}`}>
                <Trans i18nKey="sign.someError" />
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
        const className = cn(styles.txBigIcon, 'margin-main', {
            'tx-reject-icon': isReject,
            'tx-approve-icon': isApprove,
        });
        const isNotOrder = !isOrder(message.data, message.type);

        const network = selectedAccount && selectedAccount.networkCode;
        const explorerUrls = new Map([
            ['W', 'wavesexplorer.com'],
            ['T', 'testnet.wavesexplorer.com'],
            ['S', 'stagenet.wavesexplorer.com'],
            ['custom', 'wavesexplorer.com/custom']
        ]);
        const explorer = explorerUrls.get(explorerUrls.has(network) ? network : 'custom');
        const txLink = `https://${explorer}/tx/${message.messageHash}`;

        if (config.type === oauth.type && !isShowClose) {
            const method = isShowList ? 'onList' : 'onNext';
            this.props[method]();
            return null;
        }

        const showExtraButton = (isShowList && isShowClose) || (isShowNext && isShowList);

        return (
            <div className={styles.transaction}>
                <TxHeader {...this.props} hideButton={true} />

                <div className={cn(styles.finalTxScrollBox, 'transactionContent')}>
                    {isReject || isApprove ? (
                        <div
                            className={cn(styles.txBigIcon, 'margin-main', {
                                'tx-reject-icon': isReject,
                                'tx-approve-icon': isApprove,
                            })}
                        />
                    ) : null}

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
                                <Trans i18nKey="sign.viewTransaction" />
                            </a>
                        </div>
                    )}
                    {!isNotOrder && (
                        <div className={`${styles.txRow} margin-main-top`}>
                            <div className="basic500 tx-title tag1">
                                <Trans i18nKey="transactions.orderId" />
                            </div>
                            <div className="black">{message.messageHash}</div>
                        </div>
                    )}
                </div>

                <div className={cn(styles.txButtonsWrapper, { 'buttons-wrapper': showExtraButton })}>
                    {isShowList ? (
                        <Button onClick={onList}>
                            <Trans i18nKey="sign.pendingList" />
                        </Button>
                    ) : null}

                    {isShowNext ? (
                        <Button type={BUTTON_TYPE.SUBMIT} onClick={onNext}>
                            <Trans i18nKey="sign.nextTransaction" />
                        </Button>
                    ) : null}

                    {isShowClose ? (
                        <Button id="close" onClick={onClose}>
                            {isError ? <Trans i18nKey="sign.understand" /> : null}
                            {isReject || isApprove ? <Trans i18nKey="sign.close" /> : null}
                        </Button>
                    ) : null}
                </div>
            </div>
        );
    }
}
