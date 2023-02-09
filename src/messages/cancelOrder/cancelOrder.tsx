import clsx from 'clsx';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { DateFormat } from '../../ui/components/ui/Date/DateFormat';
import { type MessageOfType } from '../types';

export function CancelOrderCard({
  className,
  message,
}: {
  className?: string;
  message: MessageOfType<'cancelOrder'>;
}) {
  const { t } = useTranslation();
  const { data } = message;

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="cancel-order" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.dex')}
          </div>

          <h1 className="headline1">{t('transactions.orderCancel')}</h1>
        </div>
      </div>

      <div className={transactionsStyles.cardContent}>
        <div className={transactionsStyles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.orderId')}
          </div>

          <div
            className={transactionsStyles.txValue}
            data-testid="cancelOrderOrderId"
          >
            {data?.data?.id}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CancelOrderScreen({
  message,
  selectedAccount,
}: {
  message: MessageOfType<'cancelOrder'>;
  selectedAccount: PreferencesAccount;
}) {
  const { t } = useTranslation();

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div className={`${transactionsStyles.txScrollBox} transactionContent`}>
        <div className="margin-main">
          <CancelOrderCard message={message} />
        </div>

        <div>
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.txid')}
            </div>
            <div className={transactionsStyles.txValue}>
              {message.messageHash}
            </div>
          </div>

          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.txTime')}
            </div>
            <div className={transactionsStyles.txValue}>
              <DateFormat date={message.data.timestamp} />
            </div>
          </div>
        </div>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}
