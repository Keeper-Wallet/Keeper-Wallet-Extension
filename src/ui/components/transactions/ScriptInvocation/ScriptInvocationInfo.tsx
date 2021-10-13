import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './scriptInvocation.styl';
import { Balance, Button, BUTTON_TYPE, DateFormat } from '../../ui';
import { getAmounts, getFee } from './parseTx';
import { getMoney } from '../../../utils/converters';

const MIN_COUNT = 0;

const Transfers = ({ payment }) => {
    return <div>Info</div>;
};

const ToggleList = ({ count, currentCount, onClick }) => {
    const needShowBtn = count > MIN_COUNT;
    const showAll = !currentCount || currentCount === MIN_COUNT;
    const newCount = showAll ? count : MIN_COUNT;
    const toggle = () => onClick(newCount);

    if (!needShowBtn) {
        return null;
    }

    return (
        <div className={styles.toggleList}>
            <Button onClick={toggle} type={BUTTON_TYPE.TRANSPARENT}>
                {!showAll ? (
                    <div className={styles.buttonTextCenter}>
                        <Trans i18nKey="transactions.transfersClose">Hide</Trans>
                        <i className={styles.arrowUp}></i>
                    </div>
                ) : (
                    <div className={styles.buttonTextCenter}>
                        <Trans i18nKey="transactions.transfersShowAll">Show All</Trans>
                        <i className={styles.arrowDown}></i>
                    </div>
                )}
            </Button>
        </div>
    );
};

export class ScriptInvocationInfo extends React.PureComponent<ITransferInfo> {
    readonly state = Object.create(null);

    render() {
        const { message, assets } = this.props;
        const { messageHash, data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const fee = getMoney(getFee(tx), assets);
        const amounts = getAmounts(tx).map((item) => getMoney(item, assets));
        const hasPayment = !!(tx.payment && tx.payment.length);
        return (
            <div>
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.dApp">dApp</Trans>
                    </div>
                    <div className={styles.txValue}>{tx.dApp}</div>
                </div>
                {hasPayment && (
                    <div className={styles.txRow}>
                        <div className="tx-title tag1 basic500">
                            <Trans i18nKey="transactions.payment">Payment</Trans>
                        </div>
                        {amounts.map((amount) => (
                            <div className={styles.txValue}>
                                <Balance isShortFormat={true} balance={amount} showAsset={true} />
                            </div>
                        ))}
                    </div>
                )}
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.txid">TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{messageHash}</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.fee">Fee</Trans>
                    </div>
                    <div className={styles.txValue}>
                        <Balance isShortFormat={true} balance={fee} showAsset={true} />
                    </div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.txTime">TX Time</Trans>
                    </div>
                    <div className={styles.txValue}>
                        <DateFormat value={tx.timestamp} />
                    </div>
                </div>
            </div>
        );
    }
}

interface ITransferInfo {
    message: any;
    assets: any;
}
