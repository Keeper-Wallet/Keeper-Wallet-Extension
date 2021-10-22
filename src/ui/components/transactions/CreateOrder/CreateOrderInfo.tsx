import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './createOrder.styl';
import { Balance, DateFormat } from '../../ui';
import { getAmount, getFee, getPrice, getPriceAmount } from './parseTx';
import { getMoney } from '../../../utils/converters';

export class CreateOrderInfo extends React.PureComponent<ICreateOrderInfo> {
    render() {
        const { message, assets } = this.props;
        const { messageHash, data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx), assets);
        const price = getMoney(getPrice(tx), assets);
        const isSell = tx.orderType === 'sell';
        let iGet;

        if (!isSell) {
            iGet = getPriceAmount(tx, assets);
        } else {
            iGet = amount;
        }

        const fee = getMoney(getFee(tx), assets);
        return (
            <div>
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.orderSell" />
                    </div>
                    <div className={styles.txValue}>
                        <Balance isShortFormat={true} balance={iGet} showAsset={true} />
                    </div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.price" />
                    </div>
                    <div className={styles.txValue}>
                        <Balance isShortFormat={true} balance={price} showAsset={true} />
                    </div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.txid" />
                    </div>
                    <div className={styles.txValue}>{messageHash}</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.fee" />
                    </div>
                    <div className={styles.txValue}>
                        <Balance isShortFormat={true} balance={fee} showAsset={true} />
                    </div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.txTime" />
                    </div>
                    <div className={styles.txValue}>
                        <DateFormat value={tx.timestamp} />
                    </div>
                </div>
            </div>
        );
    }
}

interface ICreateOrderInfo {
    message: any;
    assets: any;
}
