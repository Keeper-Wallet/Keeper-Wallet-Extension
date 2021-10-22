import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './index.styl';
import { Balance, DateFormat } from '../../ui';
import { getFee } from './parseTx';
import { getMoney } from '../../../utils/converters';

export class ReissueInfo extends React.PureComponent<ITransferInfo> {
    render() {
        const { message, assets } = this.props;
        const { messageHash, data = {} } = message;
        const tx = { type: data.type, ...data.data };

        const fee = getMoney(getFee(tx), assets);
        return (
            <div>
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.txid" />
                    </div>
                    <div className={styles.txValue}>{messageHash}</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.fee" />
                    </div>
                    <div className={styles.txValue}>
                        <Balance isShortFormat={true} balance={fee} showAsset={true} />
                    </div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.txTime" />
                    </div>
                    <div className={styles.txValue}>
                        <DateFormat value={tx.timestamp} />
                    </div>
                </div>
            </div>
        );
    }
}

interface ITransferInfo {
    message: any;
    assets: any;
}
