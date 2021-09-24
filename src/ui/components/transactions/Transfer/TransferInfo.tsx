import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './transfer.styl';
import { Attachment, Balance, DateFormat } from '../../ui';
import { getAmount, getFee } from './parseTx';
import { getMoney } from '../../../utils/converters';
import { readAttachment } from '../../../utils/waves';

export class TransferInfo extends React.PureComponent<ITransferInfo> {
    render() {
        const { message, assets } = this.props;
        const { messageHash, data = {} } = message;
        const tx = { type: data.type, ...data.data };

        const fee = getMoney(getFee(tx), assets);
        const amount = getMoney(getAmount(tx), assets);
        return (
            <div>
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.sendTo">Send to</Trans>
                    </div>
                    <div className={styles.txValue}>{tx.recipient}</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey="transactions.assetId">Asset ID</Trans>
                    </div>
                    <div className={styles.txValue}>{amount.asset.id}</div>
                </div>

                {tx.attachment && tx.attachment.length ? (
                    <div className={`${styles.txRow} ${styles.txRowDescription}`}>
                        <div className="tx-title tag1 basic500">
                            <Trans i18nKey="transactions.attachment">Attachment</Trans>
                        </div>
                        <Attachment
                            className={`${styles.txValue} plate fullwidth`}
                            attachment={readAttachment(tx.attachment)}
                        />
                    </div>
                ) : null}

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

interface ITransferInfo {
    message: any;
    assets: any;
}
