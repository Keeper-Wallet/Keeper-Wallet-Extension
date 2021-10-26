import * as styles from './alias.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { messageType } from './parseTx';

interface IProps {
    className: string;
    collapsed: boolean;
    message: any;
}

export class AliasCard extends React.PureComponent<IProps> {
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
                            <Trans i18nKey="transactions.createAlias" />
                        </div>
                        <h1 className="headline1">{tx.data.alias}</h1>
                    </div>
                </div>

                <div className={styles.cardContent} />
            </div>
        );
    }
}
