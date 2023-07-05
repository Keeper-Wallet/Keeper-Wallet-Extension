import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { TxInfo } from 'messages/transaction/common/info';
import {
  isAlias,
  processAliasOrAddress,
  stringifyTransaction,
} from 'messages/utils';
import { usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Balance } from 'ui/components/ui/balance/Balance';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { AddressRecipient } from '../../ui/components/ui/Address/Recipient';
import { type MessageOfType, type MessageTxMassTransfer } from '../types';
import { Base58 } from './common/base58';
import * as styles from './massTransfer.module.css';

export function MassTransferCard({
  className,
  collapsed,
  tx,
}: {
  className?: string;
  collapsed?: boolean;
  tx: MessageTxMassTransfer;
}) {
  const { t } = useTranslation();
  const asset = usePopupSelector(state => state.assets[tx.assetId ?? 'WAVES']);
  invariant(asset);

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="mass_transfer" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.massTransfer')}
          </div>

          <h1 className="headline1">
            <Balance
              addSign="-"
              balance={
                new Money(
                  BigNumber.sum(
                    ...tx.transfers.map(transfer => transfer.amount),
                  ),
                  new Asset(asset),
                )
              }
              data-testid="massTransferAmount"
              showAsset
              showUsdAmount
              split
            />
          </h1>
        </div>
      </div>

      {!collapsed && (
        <div className={transactionsStyles.cardContent}>
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.recipients')}
            </div>

            <details className={styles.transfersDetails} open>
              <summary
                className={styles.transfersSummary}
                data-close-text={t('spoiler.hide')}
                data-count={tx.transfers.length}
                data-open-text={t('spoiler.view')}
              >
                {t('transactions.recipients')}
              </summary>

              {tx.transfers.map(({ recipient, amount }) => (
                <div
                  key={recipient}
                  className={styles.transfer}
                  data-testid="massTransferItem"
                >
                  <AddressRecipient
                    chainId={tx.chainId}
                    className={styles.recipient}
                    recipient={recipient}
                    showAliasWarning={false}
                    testid="massTransferItemRecipient"
                  />

                  <div className="body3 submit400">
                    <Balance
                      balance={new Money(amount, new Asset(asset))}
                      data-testid="massTransferItemAmount"
                      isShortFormat
                      showAsset={false}
                      showUsdAmount
                    />
                  </div>
                </div>
              ))}
            </details>

            {tx.transfers.some(({ recipient }) =>
              isAlias(processAliasOrAddress(recipient, tx.chainId)),
            ) && (
              <p className={styles.aliasWarning}>{t('address.warningAlias')}</p>
            )}
          </div>

          {tx.attachment && tx.attachment.length !== 0 && (
            <div
              className={`${transactionsStyles.txRow} ${transactionsStyles.txRowDescription}`}
            >
              <div className="tx-title tag1 basic500">
                {t('transactions.attachment')}
              </div>

              <Base58
                base58={tx.attachment}
                data-testid="massTransferAttachment"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MassTransferScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxMassTransfer;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <MassTransferCard tx={tx} />
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
