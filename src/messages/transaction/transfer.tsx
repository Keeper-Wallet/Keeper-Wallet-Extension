import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { TxInfo } from 'messages/transaction/common/info';
import { stringifyTransaction } from 'messages/utils';
import { usePopupSelector } from 'popup/store/react';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { AddressRecipient } from '../../ui/components/ui/Address/Recipient';
import { Balance } from '../../ui/components/ui/balance/Balance';
import { MessageOfType, MessageTxTransfer } from '../types';
import { Base58 } from './common/base58';

export function TransferCard({
  className,
  tx,
}: {
  className?: string;
  tx: MessageTxTransfer;
}) {
  const { t } = useTranslation();
  const assets = usePopupSelector(state => state.assets);
  const asset = assets[tx.assetId ?? 'WAVES'];
  invariant(asset);

  return (
    <div className={clsx(className, transactionsStyles.transactionCard)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="transfer" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.transfer')}
          </div>

          <h1 className="headline1">
            <Balance
              balance={
                new Money(new BigNumber(0).sub(tx.amount), new Asset(asset))
              }
              data-testid="transferAmount"
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
              recipient={tx.recipient}
              chainId={tx.chainId}
              testid="recipient"
            />
          </div>
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
              className={transactionsStyles.txValue}
              data-testid="attachmentContent"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function TransferScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxTransfer;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <TransferCard tx={tx} />
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
