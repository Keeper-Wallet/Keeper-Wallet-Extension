import * as styles from './index.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { ShowScript } from '../../ui';
import { messageType } from './parseTx';

interface IProps {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}

export class UpdateAssetInfoCard extends React.PureComponent<IProps> {
    render() {
        const className = cn(styles.updateAssetInfoTransactionCard, this.props.className, {
            [styles.updateAssetInfoCard_collapsed]: this.props.collapsed,
        });

        const { message } = this.props;
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
                            <Trans i18nKey="transactions.updateAssetInfo" />
                        </div>
                    </div>
                </div>

                <div className={styles.cardContent}>
                    {!!tx.script && (
                        <ShowScript
                            script={tx.script}
                            showNotify={true}
                            optional={true}
                            hideScript={this.props.collapsed}
                        />
                    )}
                </div>
            </div>
        );
    }
}
