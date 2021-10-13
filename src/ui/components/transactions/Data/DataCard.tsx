import * as styles from './data.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { messageType } from './parseTx';
import { ShowScript } from '../../ui';

export class DataCard extends React.PureComponent<IData> {
    render() {
        const className = cn(styles.dataTransactionCard, this.props.className, {
            [styles.dataCard_collapsed]: this.props.collapsed,
        });

        const { message } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.dataTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.dataTransaction">Entry in blockchain</Trans>
                        </div>
                        <h1 className="headline1">
                            <Trans i18nKey="transactions.dataTransactionName">Data Transaction</Trans>
                        </h1>
                    </div>
                </div>

                <div className={`${styles.cardContent} marginTop1`}>
                    <ShowScript
                        className={styles.dataScript}
                        data={tx.data || []}
                        isData={true}
                        optional={true}
                        showNotify={true}
                        hideScript={this.props.collapsed}
                    />

                    <div className={`${styles.origin} margin-main-top`}>
                        <OriginWarning message={message} />
                    </div>
                </div>
            </div>
        );
    }
}

interface IData {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}
