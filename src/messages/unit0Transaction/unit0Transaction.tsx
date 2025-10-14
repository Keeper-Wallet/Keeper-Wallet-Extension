import BigNumber from '@waves/bignumber';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { Ellipsis } from '../../ui/components/ui/ellipsis/Ellipsis';
import { type MessageOfType } from '../types';

export function Unit0TransactionCard({
  className,
  message,
}: {
  className?: string;
  collapsed?: boolean;
  message: MessageOfType<'unit0Transaction'>;
}) {
  const { t } = useTranslation();

  // Convert wei to tokens - ensure we handle string properly
  const amountInTokens = new BigNumber(message.data.value.toString()).div(
    new BigNumber(10).pow(18),
  );

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
            <span>-{amountInTokens.toFixed(8)} Unit0</span>
          </h1>
        </div>
      </div>

      <div className={transactionsStyles.cardContent}>
        <div className={transactionsStyles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.recipient')}
          </div>

          <div className={transactionsStyles.txValue}>
            <Ellipsis text={message.data.to} />
          </div>
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
  const { t } = useTranslation();

  // Convert gasPrice from wei to gwei
  const gasPriceInGwei = new BigNumber(message.data.gasPrice)
    .div(new BigNumber(10).pow(9))
    .toFixed(2);

  // Calculate total fee: gasLimit * gasPrice (in wei) / 10^18 to get Unit0
  const totalFeeInUnit0 = new BigNumber(message.data.gasLimit)
    .mul(new BigNumber(message.data.gasPrice))
    .div(new BigNumber(10).pow(18))
    .toFixed(8);

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <Unit0TransactionCard message={message} />
        </div>

        <TxDetailTabs
          json={JSON.stringify(
            {
              type: 'unit0Transaction',
              to: message.data.to,
              value: message.data.value,
              gasLimit: message.data.gasLimit,
              gasPrice: message.data.gasPrice,
              nonce: message.data.nonce,
              chainId: message.data.chainId,
            },
            null,
            2,
          )}
        >
          <div>
            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.fee')}
              </div>

              <div className={transactionsStyles.txValue}>
                {totalFeeInUnit0} Unit0
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">Gas Price</div>

              <div className={transactionsStyles.txValue}>
                {gasPriceInGwei} Gwei
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">Gas Limit</div>

              <div className={transactionsStyles.txValue}>
                {message.data.gasLimit}
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">Nonce</div>

              <div className={transactionsStyles.txValue}>
                {message.data.nonce}
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">Chain ID</div>

              <div className={transactionsStyles.txValue}>
                {message.data.chainId === 88811
                  ? 'Mainnet (88811)'
                  : 'Testnet (88817)'}
              </div>
            </div>
          </div>
        </TxDetailTabs>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}
