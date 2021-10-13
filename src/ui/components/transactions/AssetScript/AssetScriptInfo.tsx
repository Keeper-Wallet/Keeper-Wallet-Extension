import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './assetScript.styl';
import { Balance, DateFormat } from '../../ui';
import { getFee } from './parseTx';
import { getMoney } from '../../../utils/converters';

export class AssetScriptInfo extends React.PureComponent<ISetScriptInfo> {
    render() {
        const { message, assets } = this.props;
        const { messageHash, data = {} } = message;
        const tx = { type: data.type, ...data.data };

        const fee = getMoney(getFee(tx), assets);
        return (
            <div>
                <div className="font600 tag1 basic500 margin-min">
                    <Trans i18nKey="transactions.assetScriptWarningHeader">
                        Warning: actions can block transactions with your asset
                    </Trans>
                </div>
                <div className="tag1 basic500 margin-main">
                    <Trans i18nKey="transactions.assetScriptWarningDescription">
                        We do not recommend you submit script transactions unless you are an experienced user.
                    </Trans>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.txid">TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{messageHash}</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.fee">Fee</Trans>
                    </div>
                    <div className={styles.txValue}>
                        <Balance isShortFormat={true} balance={fee} showAsset={true} />
                    </div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.txTime">TX Time</Trans>
                    </div>
                    <div className={styles.txValue}>
                        <DateFormat value={tx.timestamp} />
                    </div>
                </div>
            </div>
        );
    }
}

interface ISetScriptInfo {
    message: any;
    assets: any;
}
