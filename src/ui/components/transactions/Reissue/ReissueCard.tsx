import * as styles from './index.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';

export class ReissueCard extends React.PureComponent<IIssue> {
    render() {
        const className = cn(styles.reissueTransactionCard, this.props.className, {
            [styles.reissueCard_collapsed]: this.props.collapsed,
        });

        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx), assets);

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.reissueTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.tokenReissue">Token Reissue</Trans>
                        </div>
                        <h1 className="headline1">
                            <Balance
                                split={true}
                                addSign="+ "
                                showAsset={true}
                                balance={amount}
                                className={styles.txBalanceWrapper}
                            />
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

interface IIssue {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}
