import * as styles from './createOrder.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import { I18N_NAME_SPACE } from '../../../appConfig';
import * as cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { Balance, Asset } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, getPrice } from './parseTx';

@translate(I18N_NAME_SPACE)
export class CreateOrderCard extends React.PureComponent<ICreateOrder> {
    
    render() {
        const className = cn(
            styles.createOrderTransactionCard,
            this.props.className,
            {
                [styles.createOrderCard_collapsed]: this.props.collapsed
            },
        );
        
        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx), assets);
        const price = getMoney(getPrice(tx), assets);
        const isSell = tx.orderType === 'sell';
        let iGet;
        let sign = '- ';
        if (!isSell) {
            sign = '+ ';
            iGet = amount;
        } else {
            iGet = amount.convertTo(price.asset, price.getTokens());
        }
        
        return <div className={className}>

            <div className={styles.cardHeader}>
                <div className={styles.createOrderTxIcon}>
                    <TxIcon txType={this.props.txType}/>
                </div>
                <div>
                    <div className="basic500 body3 margin-min">
                        {
                            isSell ?
                                <Trans i18nKey='transactions.orderSell'>Sell</Trans> :
                                <Trans i18nKey='transactions.orderBuy'>Buy</Trans>
                        }
                        <span>: <Asset assetId={amount.asset.id}/>/<Asset assetId={price.asset.id}/></span>
                    </div>
                    <h1 className="headline1">
                        <Balance split={true}
                                 addSign={sign}
                                 showAsset={true}
                                 balance={iGet}
                                 className={styles.txBalanceWrapper} 
                        />
                    </h1>
                </div>
            </div>

            <div className={styles.cardContent}>
                <div className={styles.origin}>
                    <OriginWarning message={message}/>
                </div>
            </div>

        </div>
    }
}

interface ICreateOrder {
    assets: any;
    className: string;
    collapsed: boolean;
    txType: string;
    message: any;
}
