import * as styles from './createOrder.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Asset, Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, getAmountSign, getPrice, getPriceAmount, getPriceSign, messageType } from './parseTx';

export class CreateOrderCard extends React.PureComponent<ICreateOrder> {
    render() {
        const className = cn(styles.createOrderTransactionCard, this.props.className, {
            [styles.createOrderCard_collapsed]: this.props.collapsed,
        });

        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const isSell = tx.orderType === 'sell';
        const amount = getMoney(getAmount(tx), assets);
        const price = getMoney(getPrice(tx), assets);

        let iGet, sign;

        if (!isSell) {
            sign = `${getAmountSign(tx)} `;
            iGet = amount;
        } else {
            sign = `${getPriceSign(tx)} `;
            iGet = getPriceAmount(tx, assets);
        }

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.createOrderTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey={isSell ? 'transactions.orderSell' : 'transactions.orderBuy'} />
                            <span>
                                : <Asset assetId={amount.asset.id} />/<Asset assetId={price.asset.id} />
                            </span>
                        </div>
                        <h1 className="headline1">
                            <Balance
                                split={true}
                                addSign={sign}
                                showAsset={true}
                                balance={iGet}
                                className={styles.txBalanceWrapper}
                            />
                        </h1>
                    </div>
                </div>

                <div className={styles.cardContent} />
            </div>
        );
    }
}

interface ICreateOrder {
    assets: any;
    className: string;
    collapsed: boolean;

    message: any;
}
