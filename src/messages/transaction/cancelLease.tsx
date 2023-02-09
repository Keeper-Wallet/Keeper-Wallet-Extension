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
import { Balance } from 'ui/components/ui/balance/Balance';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { AddressRecipient } from '../../ui/components/ui/Address/Recipient';
import { type MessageOfType, type MessageTxCancelLease } from '../types';

export function CancelLeaseCard({
  className,
  tx,
}: {
  className?: string;
  tx: MessageTxCancelLease;
}) {
  const { t } = useTranslation();
  const asset = usePopupSelector(state => state.assets.WAVES);

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="cancel-leasing" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.leaseCancel')}
          </div>

          <h1 className="headline1">
            <Balance
              balance={new Money(tx.lease.amount, new Asset(asset))}
              data-testid="cancelLeaseAmount"
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
              recipient={tx.lease.recipient}
              chainId={tx.chainId}
              testid="cancelLeaseRecipient"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CancelLeaseScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxCancelLease;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div className={`${transactionsStyles.txScrollBox} transactionContent`}>
        <div className="margin-main">
          <CancelLeaseCard tx={tx} />
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
