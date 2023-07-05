import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { Expandable } from 'messages/_common/expandable';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { Script } from 'messages/_common/script';
import { TxInfo } from 'messages/transaction/common/info';
import { stringifyTransaction } from 'messages/utils';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';
import { Balance } from 'ui/components/ui/balance/Balance';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { type MessageOfType, type MessageTxIssue } from '../types';

export function IssueCard({
  className,
  collapsed,
  tx,
}: {
  className?: string;
  collapsed?: boolean;
  tx: MessageTxIssue;
}) {
  const { t } = useTranslation();

  const isNFT =
    !tx.reissuable && tx.decimals === 0 && new BigNumber(tx.quantity).eq(1);

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="issue" />
        </div>

        <div>
          <div className="basic500 body3 margin-min" data-testid="issueType">
            {isNFT
              ? tx.script
                ? t('transactions.issueSmartNFT')
                : t('transactions.issueNFT')
              : tx.script
              ? t('transactions.issueSmartToken')
              : t('transactions.issueToken')}
          </div>

          <h1 className="headline1">
            <Balance
              balance={
                new Money(
                  tx.quantity,
                  new Asset({
                    ...tx,
                    height: 0,
                    id: '',
                    precision: tx.decimals,
                    sender: '',
                    timestamp: new Date(tx.timestamp),
                  }),
                )
              }
              data-testid="issueAmount"
              showAsset
              showUsdAmount
              split
            />
          </h1>
        </div>
      </div>

      <div className={transactionsStyles.cardContent}>
        {tx.description && (
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.description')}
            </div>

            <div
              className={transactionsStyles.txValue}
              data-testid="issueDescription"
            >
              {tx.description}
            </div>
          </div>
        )}

        {!isNFT && (
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.decimalPoints')}
            </div>

            <div
              className={transactionsStyles.txValue}
              data-testid="issueDecimals"
            >
              {tx.decimals}
            </div>
          </div>
        )}

        {!isNFT && (
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.issueType')}
            </div>

            <div
              className={transactionsStyles.txValue}
              data-testid="issueReissuable"
            >
              {t(
                tx.reissuable
                  ? 'transactions.reissuable'
                  : 'transactions.noReissuable',
              )}
            </div>
          </div>
        )}

        {tx.script && (
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.script')}
            </div>

            <div className={transactionsStyles.txValue}>
              <Expandable allowExpanding={!collapsed} textToCopy={tx.script}>
                <Script script={tx.script} />
              </Expandable>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function IssueScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxIssue;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <IssueCard tx={tx} />
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
