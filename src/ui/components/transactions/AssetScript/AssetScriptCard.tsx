import * as styles from './index.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import cn from 'classnames';
import { messageType } from './parseTx';
import { ShowScript } from '../../ui';

export class AssetScriptCard extends React.PureComponent<ISetScript> {
    render() {
        const className = cn(styles.assetScriptTransactionCard, this.props.className, {
            [styles.assetScriptCard_collapsed]: this.props.collapsed,
        });

        const { message } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const script = tx.script;
        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.assetScriptTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.dataTransaction">Entry in blockchain</Trans>
                        </div>
                        <h1 className="headline1">
                            <Trans i18nKey="transactions.assetScriptTransaction">Set Asset Script transaction</Trans>
                        </h1>
                    </div>
                </div>

                <div className={styles.cardContent}>
                    <ShowScript script={script} showNotify={true} hideScript={this.props.collapsed} />
                </div>
            </div>
        );
    }
}

interface ISetScript {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}
