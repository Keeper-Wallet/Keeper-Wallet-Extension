import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { TxInfo } from 'messages/transaction/common/info';
import { stringifyTransaction } from 'messages/utils';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { MessageOfType, MessageTxAlias } from '../types';

export function AliasCard({
  className,
  tx,
}: {
  className?: string;
  tx: MessageTxAlias;
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx(className, transactionsStyles.transactionCard)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="create-alias" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.createAlias')}
          </div>

          <h1 className="headline1" data-testid="aliasValue">
            {tx.alias}
          </h1>
        </div>
      </div>
    </div>
  );
}

export function AliasScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxAlias;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <AliasCard tx={tx} />
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
