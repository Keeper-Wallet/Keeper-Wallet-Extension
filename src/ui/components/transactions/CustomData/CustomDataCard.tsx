import * as styles from './customData.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
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
                            <Trans i18nKey="sign.customData" />
                        </div>
                        <h1 className="headline1">
                            <Trans i18nKey="sign.customDataName" />
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
