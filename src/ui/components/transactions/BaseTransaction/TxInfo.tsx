import * as React from 'react';
import { connect } from 'react-redux';
import * as styles from '../../pages/styles/transactions.styl';
import { Trans } from 'react-i18next';
import { DateFormat } from '../../ui';
import { TxFee } from './TxFee';

interface BalanceAsset {
  balance: string;
  minSponsoredAssetFee: string;
  sponsorBalance: string;
}

export interface BalanceAssets {
  [assetId: string]: BalanceAsset;
}

export interface Balance {
  assets: BalanceAssets;
  available: string;
  leasedOut: string;
  network: string;
}

interface Props {
  message: any;
  assets: any;
  sponsoredBalance?: BalanceAssets;
}

export const TxInfo = connect(
  (store: any, ownProps?: any) => ({
    message: ownProps?.message || store.activePopup?.msg,
    assets: ownProps?.assets || store.assets,
  }),
  null
)(function TxInfo({ message, sponsoredBalance }: Props) {
  const { messageHash, data = {} } = message;
  const tx = { type: data.type, ...data.data };

  return (
    <div>
      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">
          <Trans i18nKey="transactions.fee" />
        </div>
        <div className={styles.txValue}>
          <TxFee message={message} sponsoredBalance={sponsoredBalance} />
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

      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">
          <Trans i18nKey="transactions.txid" />
        </div>
        <div className={styles.txValue}>{messageHash}</div>
      </div>
    </div>
  );
});
