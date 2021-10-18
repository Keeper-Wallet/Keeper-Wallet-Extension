import * as styles from './alias.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import cn from 'classnames';
import { messageType } from './parseTx';

export class AliasCard extends React.PureComponent<IAlias> {
    render() {
        const className = cn(styles.aliasTransactionCard, this.props.className, {
            [styles.aliasCard_collapsed]: this.props.collapsed,
        });

        const { message } = this.props;
        const { data: tx } = message;

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.aliasTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.createAlias">Create Alias</Trans>
                        </div>
                        <h1 className="headline1">{tx.data.alias}</h1>
                    </div>
                </div>

                <div className={styles.cardContent} />
            </div>
        );
    }
}

interface IAlias {
    className: string;
    collapsed: boolean;
    message: any;
}
