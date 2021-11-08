import * as styles from './createOrder.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Asset, Balance, DateFormat } from '../../ui';
import { getMoney } from '../../../utils/converters';
import {
  getAmount,
  getAmountSign,
  getPrice,
  getPriceAmount,
  getPriceSign,
  messageType,
} from './parseTx';

interface IProps {
  assets: any;
  className: string;
  collapsed: boolean;
  message: any;
}

export class CreateOrderCard extends React.PureComponent<IProps> {
  render() {
    const className = cn(
      styles.createOrderTransactionCard,
      this.props.className,
      {
        [styles.createOrderCard_collapsed]: this.props.collapsed,
      }
    );

    const { message, assets } = this.props;
    const { data = {} } = message;
    const tx = { type: data.type, ...data.data };
    const isSell = tx.orderType === 'sell';
    const amount = getMoney(getAmount(tx), assets);
    const price = getMoney(getPrice(tx), assets);

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.createOrderTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              <Trans
                i18nKey={
                  isSell ? 'transactions.orderSell' : 'transactions.orderBuy'
                }
              />
              <span>
                : <Asset assetId={amount.asset.id} />/
                <Asset assetId={price.asset.id} />
              </span>
            </div>
            <h1 className="headline1">
              <Balance
                split={true}
                addSign={getAmountSign(tx)}
                showAsset={true}
                balance={amount}
                className={styles.txBalanceWrapper}
              />
            </h1>
            <h1 className="headline1">
              <Balance
                split={true}
                addSign={getPriceSign(tx)}
                showAsset={true}
                balance={getPriceAmount(tx, assets)}
                className={styles.txBalanceWrapper}
              />
            </h1>
          </div>
        </div>

        <div className={styles.cardContent}>
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
              <Trans i18nKey="transactions.expires" />
            </div>
            <div className={styles.txValue}>
              <DateFormat value={tx.expiration} />
            </div>
          </div>

          <div className={styles.txRow}>
            <div className="tx-title tag1 basic500">
              <Trans i18nKey="transactions.matcherPublicKey" />
            </div>
            <div className={styles.txValue}>{tx.matcherPublicKey}</div>
          </div>
        </div>
      </div>
    );
  }
}
