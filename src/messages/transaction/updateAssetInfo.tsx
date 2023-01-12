import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { stringifyTransaction } from 'messages/utils';
import { usePopupSelector } from 'popup/store/react';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { Balance, DateFormat } from '../../ui/components/ui';
import { MessageOfType, MessageTxUpdateAssetInfo } from '../types';

export function UpdateAssetInfoCard({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="updateAssetInfo" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.updateAssetInfo')}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpdateAssetInfoScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxUpdateAssetInfo;
}) {
  const { t } = useTranslation();
  const assets = usePopupSelector(state => state.assets);

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <UpdateAssetInfoCard />
        </div>

        <TxDetailTabs
          json={stringifyTransaction(message.data, { pretty: true })}
        >
          <div>
            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.assetId')}
              </div>

              <div
                className={transactionsStyles.txValue}
                data-testid="updateAssetInfoAssetId"
              >
                {tx.assetId}
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.name')}
              </div>

              <div
                className={transactionsStyles.txValue}
                data-testid="updateAssetInfoAssetName"
              >
                {tx.name}
              </div>
            </div>

            {tx.description ? (
              <div className={transactionsStyles.txRow}>
                <div className="tx-title tag1 basic500">
                  {t('transactions.description')}
                </div>

                <div
                  className={transactionsStyles.txValue}
                  data-testid="updateAssetInfoAssetDescription"
                >
                  {tx.description}
                </div>
              </div>
            ) : null}

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.txid')}
              </div>

              <div className={transactionsStyles.txValue}>
                {message.data.id}
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.fee')}
              </div>

              <div className={transactionsStyles.txValue}>
                <Balance
                  balance={new Money(tx.fee, new Asset(assets.WAVES))}
                  data-testid="updateAssetInfoFee"
                  isShortFormat
                  showAsset
                />
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.txTime')}
              </div>

              <div className={transactionsStyles.txValue}>
                <DateFormat date={tx.timestamp} />
              </div>
            </div>
          </div>
        </TxDetailTabs>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}
