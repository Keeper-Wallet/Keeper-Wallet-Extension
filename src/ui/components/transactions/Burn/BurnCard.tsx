import * as styles from './burn.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';

export class BurnCard extends React.PureComponent<IBurn> {
    render() {
        const className = cn(styles.burnTransactionCard, this.props.className, {
            [styles.burnCard_collapsed]: this.props.collapsed,
        });

        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx), assets);

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.burnTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.burn">Token Burn</Trans>
                        </div>
                        <h1 className="headline1">
                            <Balance split={true} addSign="- " showAsset={true} balance={amount} />
                        </h1>
                    </div>
                </div>

                <div className={styles.cardContent}>
                    <div className={styles.origin}>
                        <OriginWarning message={message} />
                    </div>
                </div>
            </div>
        );
    }
}

interface IBurn {
    assets: any;
    className: string;
    collapsed: boolean;
    message: any;
}
