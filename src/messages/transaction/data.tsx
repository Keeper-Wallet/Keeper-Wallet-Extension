import clsx from 'clsx';
import { DataEntries } from 'messages/_common/dataEntries';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { Expandable } from 'messages/_common/expandable';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { TxInfo } from 'messages/transaction/common/info';
import { stringifyTransaction } from 'messages/utils';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { MessageOfType, MessageTxData } from '../types';
import * as styles from './data.module.css';

export function DataCard({
  className,
  collapsed,
  tx,
}: {
  className?: string;
  collapsed?: boolean;
  tx: MessageTxData;
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="data" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.dataTransaction')}
          </div>

          <h1 className="headline1">{t('transactions.dataTransactionName')}</h1>
        </div>
      </div>

      <div className={styles.cardContent}>
        <Expandable
          allowExpanding={!collapsed}
          textToCopy={JSON.stringify(tx.data, null, 2)}
        >
          <DataEntries entries={tx.data} />
        </Expandable>
      </div>
    </div>
  );
}

export function DataScreen({
  message,
  selectAccount,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectAccount: () => void;
  selectedAccount: PreferencesAccount;
  tx: MessageTxData;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader
        message={message}
        selectedAccount={selectedAccount}
        selectAccount={selectAccount}
      />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <DataCard tx={tx} />
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
