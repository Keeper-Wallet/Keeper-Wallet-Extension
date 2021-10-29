import * as styles from './setScript.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { messageType } from './parseTx';
import { ShowScript } from '../../ui';

interface IProps {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}

export class SetScriptCard extends React.PureComponent<IProps> {
    render() {
        const className = cn(styles.setScriptTransactionCard, this.props.className, {
            [styles.setScriptCard_collapsed]: this.props.collapsed,
        });

        const { message, collapsed } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const script = tx.script;
        return (
            <>
                <div className={className}>
                    <div className={styles.cardHeader}>
                        <div className={styles.setScriptTxIcon}>
                            <TxIcon txType={messageType} />
                        </div>
                        <div>
                            <div className="basic500 body3 margin-min">
                                <Trans i18nKey="transactions.dataTransaction" />
                            </div>
                            <h1 className="headline1">
                                <Trans i18nKey="transactions.setScriptTransaction" />
                            </h1>
                        </div>
                    </div>

                    <div className={`${styles.cardContent} marginTop1`}>
                        <ShowScript script={script} showNotify={true} hideScript={this.props.collapsed} />
                    </div>
                </div>
                {!collapsed ? (
                    <>
                        <div className="font600 tag1 basic500 margin-min margin-main-top">
                            <Trans i18nKey="transactions.scriptWarningHeader" />
                        </div>

                        <div className="tag1 basic500 margin-main">
                            <Trans i18nKey="transactions.scriptWarningDescription" />
                        </div>
                    </>
                ) : null}
            </>
        );
    }
}
