import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { stringifyOrder } from 'messages/utils';
import { usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Balance } from 'ui/components/ui/balance/Balance';
import { DateFormat } from 'ui/components/ui/Date/DateFormat';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { type MessageOfType } from '../types';

export function OrderCard({
  className,
  message,
}: {
  className?: string;
  message: MessageOfType<'order'>;
}) {
  const { t } = useTranslation();

  const amountAsset = usePopupSelector(
    state => state.assets[message.data.assetPair.amountAsset ?? 'WAVES']
  );
  invariant(amountAsset);
  const amount = new Money(message.data.amount, new Asset(amountAsset));

  const priceAsset = usePopupSelector(
    state => state.assets[message.data.assetPair.priceAsset ?? 'WAVES']
  );
  invariant(priceAsset);

  const priceInput = new Money(message.data.price, new Asset(priceAsset));

  const price = Money.fromTokens(
    priceInput
      .getCoins()
      .mul(
        new BigNumber(10).pow(
          message.data.version < 4 || message.data.priceMode === 'assetDecimals'
            ? amount.asset.precision - priceInput.asset.precision - 8
            : -8
        )
      ),
    priceInput.asset
  );

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="create-order" />
        </div>

        <div>
          <div
            className="basic500 body3 margin-min"
            data-testid="createOrderTitle"
          >
            {t(
              message.data.orderType === 'sell'
                ? 'transactions.orderSell'
                : 'transactions.orderBuy'
            )}
            <span>
              : <span>{amountAsset.displayName}</span>/
              <span>{priceAsset.displayName}</span>
            </span>
          </div>

          <h1 className="headline1 margin-min">
            <Balance
              addSign={message.data.orderType === 'sell' ? '-' : '+'}
              balance={amount}
              data-testid="createOrderTitleAmount"
              showAsset
              split
              showUsdAmount
            />
          </h1>

          <h1 className="headline1">
            <Balance
              addSign={message.data.orderType === 'sell' ? '+' : '-'}
              balance={amount.convertTo(price.asset, price.getTokens())}
              data-testid="createOrderTitlePrice"
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
            {t('transactions.price')}
          </div>

          <div className={transactionsStyles.txValue}>
            <Balance
              data-testid="createOrderPrice"
              isShortFormat
              balance={price}
              showAsset
              showUsdAmount
            />
          </div>
        </div>

        <div className={transactionsStyles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.expires')}
          </div>

          <div className={transactionsStyles.txValue}>
            <DateFormat date={message.data.expiration} />
          </div>
        </div>

        <div className={transactionsStyles.txRow}>
          <div className="tx-title tag1 basic500">
            {t('transactions.matcherPublicKey')}
          </div>

          <div
            className={transactionsStyles.txValue}
            data-testid="createOrderMatcherPublicKey"
          >
            {message.data.matcherPublicKey}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderScreen({
  message,
  selectedAccount,
}: {
  message: MessageOfType<'order'>;
  selectedAccount: PreferencesAccount;
}) {
  const { t } = useTranslation();

  const matcherFeeAsset = usePopupSelector(
    state => state.assets[message.data.matcherFeeAssetId ?? 'WAVES']
  );
  invariant(matcherFeeAsset);

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <OrderCard message={message} />
        </div>

        <TxDetailTabs json={stringifyOrder(message.data, { pretty: true })}>
          <div>
            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.txid')}
              </div>

              <div className={transactionsStyles.txValue}>
                {message.data.id}
              </div>
            </div>

            <div className={transactionsStyles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.fee')}
              </div>

              <div className={transactionsStyles.txValue}>
                <Balance
                  balance={
                    new Money(
                      message.data.matcherFee,
                      new Asset(matcherFeeAsset)
                    )
                  }
                  data-testid="createOrderFee"
                  isShortFormat
                  showAsset
                />
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
        </TxDetailTabs>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}
