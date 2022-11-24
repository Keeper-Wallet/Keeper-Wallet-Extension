import { MessageStoreItem } from 'messages/types';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'ui/store';

import * as styles from '../../pages/styles/transactions.styl';
import { DateFormat } from '../../ui';
import { TxFee } from './TxFee';

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
  message?: Extract<MessageStoreItem, { type: 'transaction' }>;
}

export function TxInfo({ message: messageProp }: Props) {
  const { t } = useTranslation();

  const messageFromState = useAppSelector(
    state => state.activePopup?.msg
  ) as Extract<MessageStoreItem, { type: 'transaction' }>;

  const message = messageProp || messageFromState;

  return (
    <div>
      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">{t('transactions.fee')}</div>
        <div className={styles.txValue}>
          <TxFee message={message} />
        </div>
      </div>

      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">{t('transactions.txTime')}</div>
        <div className={styles.txValue}>
          <DateFormat date={message?.data?.data?.timestamp} />
        </div>
      </div>

      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">{t('transactions.txid')}</div>
        <div className={styles.txValue}>{message.messageHash}</div>
      </div>
    </div>
  );
}
