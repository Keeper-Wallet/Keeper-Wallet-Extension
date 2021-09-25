import * as styles from './index.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { ShowScript } from '../../ui';

export class CustomDataCard extends React.PureComponent<IData> {
    render() {
        const className = cn(styles.dataTransactionCard, this.props.className, {
            [styles.dataCard_collapsed]: this.props.collapsed,
        });

        const { message } = this.props;
        const { data = {} } = message;
        const { data: dataToShow, binary } = data;
        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.dataTxIcon}>
                        <TxIcon txType={'authOrigin'} small={true} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans i18nKey="transactions.customData">Custom Data</Trans>
                        </div>
                        <h1 className="headline1">
                            <Trans i18nKey="transactions.customDataName">Sign Custom Data</Trans>
                        </h1>
                    </div>
                </div>

                <div className={`${styles.cardContent} marginTop1`}>
                    <ShowScript
                        className={styles.dataScript}
                        data={dataToShow || []}
                        script={binary || ''}
                        isData={!!dataToShow}
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
