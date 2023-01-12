import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { Expandable } from 'messages/_common/expandable';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { TxInfo } from 'messages/transaction/common/info';
import { stringifyTransaction } from 'messages/utils';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import { Script } from '../_common/script';
import { MessageOfType, MessageTxSetScript } from '../types';
import * as styles from './setScript.module.css';

export function SetScriptCard({
  className,
  collapsed,
  tx,
}: {
  className?: string;
  collapsed?: boolean;
  tx: MessageTxSetScript;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={clsx(styles.card, className)}>
        {tx.script ? (
          <div className={styles.header}>
            <MessageIcon className={styles.icon} type="set-script" />

            <div>
              <div className={styles.data}>
                {t('transactions.dataTransaction')}
              </div>

              <h1 className={styles.title} data-testid="setScriptTitle">
                {t('transactions.setScriptTransaction')}
              </h1>
            </div>
          </div>
        ) : (
          <div className={styles.header}>
            <MessageIcon className={styles.icon} type="set-script-cancel" />

            <h1 className={styles.title} data-testid="setScriptTitle">
              {t('transactions.setScriptTransactionCancel')}
            </h1>
          </div>
        )}

        {tx.script && (
          <div className="marginTop1">
            <Expandable allowExpanding={!collapsed} textToCopy={tx.script}>
              <Script script={tx.script} />
            </Expandable>
          </div>
        )}
      </div>

      {!collapsed ? (
        <>
          <div className="font700 tag1 basic500 margin-min margin-main-top">
            {t('transactions.scriptWarningHeader')}
          </div>

          <div className="tag1 basic500 margin-main">
            {t('transactions.scriptWarningDescription')}
          </div>
        </>
      ) : null}
    </>
  );
}

export function SetScriptScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxSetScript;
}) {
  return (
    <div className={styles.screen}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div className={clsx(styles.scrollBox, 'transactionContent')}>
        <div className="margin-main">
          <SetScriptCard tx={tx} />
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
