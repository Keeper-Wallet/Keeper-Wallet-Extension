import * as styles from './assetScript.styl';
import * as React from 'react'
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { messageType } from './parseTx';
import { Asset, ShowScript } from '../../ui';

export class AssetScriptCard extends React.PureComponent<ISetScript> {
    render() {
        const className = cn(styles.assetScriptTransactionCard, this.props.className, {
            [styles.assetScriptCard_collapsed]: this.props.collapsed,
        });

        const { message, collapsed } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const script = tx.script;
        return (
            <>
                <div className={className}>
                    <div className={styles.cardHeader}>
                        <div className={styles.assetScriptTxIcon}>
                            <TxIcon txType={messageType} />
                        </div>
                        <div>
                            <div className="basic500 body3 margin-min">
                                <Trans i18nKey="transactions.assetScriptTransaction" />
                            </div>
                            <h1 className="headline1">
                                <Asset assetId={tx.assetId} />
                            </h1>
                        </div>
                    </div>

                    <div className={cn(styles.cardContent, 'marginTop1')}>
                        <ShowScript script={script} showNotify={true} hideScript={this.props.collapsed} />
                    </div>
                </div>
                {!collapsed ? (
                    <>
                        <div className="font600 tag1 basic500 margin-min margin-main-top">
                            <Trans i18nKey="transactions.assetScriptWarningHeader" />
                        </div>

                        <div className="tag1 basic500 margin-main">
                            <Trans i18nKey="transactions.assetScriptWarningDescription" />
                        </div>
                    </>
                ) : null}
            </>
        );
    }
}

interface ISetScript {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}
