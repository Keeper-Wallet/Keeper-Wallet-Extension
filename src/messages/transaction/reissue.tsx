import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { TxInfo } from 'messages/transaction/common/info';
import { stringifyTransaction } from 'messages/utils';
import { usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Balance } from 'ui/components/ui/balance/Balance';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { type MessageOfType, type MessageTxReissue } from '../types';

export function ReissueCard({
  className,
  tx,
}: {
  className?: string;
  tx: MessageTxReissue;
}) {
  const { t } = useTranslation();
  const asset = usePopupSelector(state => state.assets[tx.assetId]);
  invariant(asset);

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="reissue" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.reissue')}
          </div>

          <h1 className="headline1">
            <Balance
              addSign="+"
              balance={new Money(tx.quantity, new Asset(asset))}
              data-testid="reissueAmount"
              showAsset
              showUsdAmount
              split
            />
          </h1>
        </div>
      </div>

      <div className={transactionsStyles.cardContent}>
        <div className={transactionsStyles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.issueType')}
          </div>

          <div
            className={transactionsStyles.txValue}
            data-testid="reissueReissuable"
          >
            {t(
              tx.reissuable
                ? 'transactions.reissuable'
                : 'transactions.noReissuable',
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReissueScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxReissue;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <ReissueCard tx={tx} />
        </div>

        <TxDetailTabs
          json={stringifyTransaction(message.data, { pretty: true })}
        >
          <TxInfo message={message} />
        </TxDetailTabs>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}
