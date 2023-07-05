import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { Expandable } from 'messages/_common/expandable';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { TxInfo } from 'messages/transaction/common/info';
import { stringifyTransaction } from 'messages/utils';
import { usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { AddressRecipient } from 'ui/components/ui/Address/Recipient';
import { Balance } from 'ui/components/ui/balance/Balance';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { type MessageOfType, type MessageTxInvokeScript } from '../types';
import * as styles from './invokeScript.module.css';

export function InvokeScriptCard({
  collapsed,
  tx,
}: {
  collapsed?: boolean;
  tx: MessageTxInvokeScript;
}) {
  const { t } = useTranslation();
  const assets = usePopupSelector(state => state.assets);

  return (
    <div className={transactionsStyles.transactionCard}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="script_invocation" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.scriptInvocation')}
          </div>

          <h1 className="headline1" data-testid="invokeScriptPaymentsTitle">
            {t(
              tx.payment.length !== 0
                ? 'transactions.paymentsCount'
                : 'transactions.paymentsNone',
              { count: tx.payment.length ?? 0 },
            )}
          </h1>
        </div>
      </div>

      <div className={transactionsStyles.cardContent}>
        <div className={transactionsStyles.txRow}>
          <div className="tx-title tag1 basic500">{t('transactions.dApp')}</div>

          <div className={transactionsStyles.txValue}>
            <AddressRecipient
              recipient={tx.dApp}
              chainId={tx.chainId}
              testid="invokeScriptDApp"
            />
          </div>
        </div>

        <div className={transactionsStyles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.scriptInvocationFunction')}
          </div>

          <div
            className={transactionsStyles.txValue}
            data-testid="invokeScriptFunction"
          >
            {tx.call?.function ?? 'default'}
          </div>
        </div>

        {tx.call && tx.call.args.length !== 0 && (
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.arguments')}
            </div>

            <div className={transactionsStyles.txValue}>
              <Expandable
                allowExpanding={!collapsed}
                textToCopy={JSON.stringify(tx.call.args, null, 2)}
              >
                <table className={styles.argsTable}>
                  <thead>
                    <tr className="basic500">
                      <td>{t('showScriptComponent.type')}</td>
                      <td>{t('showScriptComponent.value')}</td>
                    </tr>
                  </thead>

                  <tbody>
                    {tx.call.args.map((arg, index) => (
                      <tr key={index} data-testid="invokeArgument">
                        <td data-testid="invokeArgumentType">{arg.type}</td>

                        <td data-testid="invokeArgumentValue">
                          {Array.isArray(arg.value)
                            ? JSON.stringify(arg.value, null, 2)
                            : String(arg.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Expandable>
            </div>
          </div>
        )}

        {tx.payment.length !== 0 && (
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.payments')}
            </div>

            <div className={transactionsStyles.txValue}>
              <div className={clsx('plate', 'break-all')}>
                {tx.payment.map((item, index) => {
                  const asset = assets[item.assetId ?? 'WAVES'];
                  invariant(asset);

                  return (
                    <div key={index} className={styles.paymentItem}>
                      <Balance
                        balance={new Money(item.amount, new Asset(asset))}
                        data-testid="invokeScriptPaymentItem"
                        isShortFormat
                        showAsset
                        showUsdAmount
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function InvokeScriptScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxInvokeScript;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <InvokeScriptCard tx={tx} />
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
