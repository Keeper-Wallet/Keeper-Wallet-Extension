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

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { Balance } from '../../ui/components/ui';
import { AddressRecipient } from '../../ui/components/ui/Address/Recipient';
import { type MessageOfType, type MessageTxLease } from '../types';

export function LeaseCard({
  className,
  tx,
}: {
  className?: string;
  tx: MessageTxLease;
}) {
  const { t } = useTranslation();
  const asset = usePopupSelector(state => state.assets.WAVES);

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="lease" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.lease')}
          </div>

          <h1 className="headline1">
            <Balance
              balance={new Money(tx.amount, new Asset(asset))}
              data-testid="leaseAmount"
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
            {t('transactions.recipient')}
          </div>

          <div className={transactionsStyles.txValue}>
            <AddressRecipient
              chainId={tx.chainId}
              recipient={tx.recipient}
              testid="leaseRecipient"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeaseScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxLease;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <LeaseCard tx={tx} />
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
