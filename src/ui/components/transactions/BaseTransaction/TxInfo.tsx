import * as React from 'react';
import { connect } from 'react-redux';
import * as styles from '../../pages/styles/transactions.styl';
import { useTranslation } from 'react-i18next';
import { DateFormat } from '../../ui';
import { TxFee } from './TxFee';
import { AppState } from 'ui/store';
import { AssetDetail } from 'ui/services/Background';

export interface Balance {
  assets: BalanceAssets;
  available: string;
  leasedOut: string;
  network: string;
}

export interface BalanceAssets {
  [assetId: string]: BalanceAsset;
}

export interface BalanceAsset {
  balance: string;
  minSponsoredAssetFee: string;
  sponsorBalance: string;
}

interface Props {
  message: any;
  assets: Record<string, AssetDetail>;
  sponsoredBalance?: BalanceAssets;
}

export const TxInfo = connect((store: AppState, ownProps?: any) => ({
  message: ownProps?.message || store.activePopup?.msg,
  assets: ownProps?.assets || store.assets,
}))(function TxInfo({ message, sponsoredBalance }: Props) {
  const { t } = useTranslation();
  const { messageHash, data = {} } = message;
  const tx = { type: data.type, ...data.data };

  return (
    <div>
      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">{t('transactions.fee')}</div>
        <div className={styles.txValue}>
          <TxFee message={message} sponsoredBalance={sponsoredBalance} />
        </div>
      </div>

      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">{t('transactions.txTime')}</div>
        <div className={styles.txValue}>
          <DateFormat date={tx.timestamp} />
        </div>
      </div>

      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">{t('transactions.txid')}</div>
        <div className={styles.txValue}>{messageHash}</div>
      </div>
    </div>
  );
});
