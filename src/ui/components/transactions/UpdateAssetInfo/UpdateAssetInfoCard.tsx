import * as styles from './index.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import * as cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { ShowScript } from '../../ui';
import { messageType } from './parseTx';

export class UpdateAssetInfoCard extends React.PureComponent<IUpdateAssetInfo> {
    render() {
        const className = cn(styles.updateAssetInfoTransactionCard, this.props.className, {
            [styles.updateAssetInfoCard_collapsed]: this.props.collapsed,
        });

        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.updateAssetInfoTxIcon}>
                        <TxIcon txType={messageType} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.updateAssetInfo">Update Asset Info</Trans>
                        </div>
                    </div>
                </div>

                <div className={styles.cardContent}>
                    <ShowScript
                        script={tx.script}
                        showNotify={true}
                        optional={true}
                        hideScript={this.props.collapsed}
                    />

                    <div className={styles.origin}>
                        <OriginWarning message={message} />
                    </div>
                </div>
            </div>
        );
    }
}

interface IUpdateAssetInfo {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}
