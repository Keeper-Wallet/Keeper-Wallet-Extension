import clsx from 'clsx';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { type MessageOfType } from '../types';

export function Unit0TransactionCard({
  message,
}: {
  collapsed?: boolean;
  message: MessageOfType<'unit0Transaction'>;
}) {
  const { t } = useTranslation();

  return (
    <div className={transactionsStyles.transactionCard}>
      <div className={transactionsStyles.cardHeader}>
        <div>
          <div className="basic500 body3 margin-min">Unit0 Transfer</div>

          <h1 className="headline1">
            {(Number(message.data.value) / 1e18).toFixed(6)} Unit0
          </h1>
        </div>
      </div>

      <div className={transactionsStyles.cardContent}>
        <div className={transactionsStyles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.recipient')}
          </div>
          <div className={transactionsStyles.txValue}>{message.data.to}</div>
        </div>
      </div>
    </div>
  );
}

export function Unit0TransactionScreen({
  message,
  selectedAccount,
}: {
  message: MessageOfType<'unit0Transaction'>;
  selectedAccount: PreferencesAccount;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <Unit0TransactionCard message={message} />

          <div className="margin-main-big">
            <div className="basic500 body3 margin-min">Gas Price</div>
            <div className="headline2">{message.data.gasPrice} Gwei</div>
          </div>

          <div className="margin-main-big">
            <div className="basic500 body3 margin-min">Gas Limit</div>
            <div className="headline2">{message.data.gasLimit}</div>
          </div>

          <div className="margin-main-big">
            <div className="basic500 body3 margin-min">Nonce</div>
            <div className="headline2">{message.data.nonce}</div>
          </div>
        </div>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}
