import * as styles from './cancelOrder.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import { I18N_NAME_SPACE } from '../../../appConfig';
import * as cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount } from './parseTx';

@translate(I18N_NAME_SPACE)
export class CancelOrderCard extends React.PureComponent<ICancelOrder> {
    
    render() {
        const className = cn(
            styles.cancelOrderTransactionCard,
            this.props.className,
            {
                [styles.cancelOrderCard_collapsed]: this.props.collapsed
            },
        );
        
        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx), assets);
        
        return <div className={className}>

            <div className={styles.cardHeader}>
                <div className={styles.cancelOrderTxIcon}>
                    <TxIcon txType={this.props.txType}/>
                </div>
                <div>
                    <div className="basic500 body3 margin-min">
                        <Trans i18nKey='transactions.dex'>DEX</Trans>
                    </div>
                    <h1 className="headline1">
                        <Trans i18nKey='transactions.orderCancel'>Cancel the order</Trans>
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

interface ICancelOrder {
    assets: any;
    className: string;
    collapsed: boolean;
    txType: string;
    message: any;
}
