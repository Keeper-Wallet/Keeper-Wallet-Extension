import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type AssetsRecord } from 'assets/types';
import clsx from 'clsx';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { TxInfo } from 'messages/transaction/common/info';
import { TransactionCard } from 'messages/transaction/transaction';
import { usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Balance } from 'ui/components/ui/balance/Balance';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { type MessageOfType, type MessageTx } from '../types';
import * as styles from './transactionPackage.module.css';

function getBalanceChanges(tx: MessageTx, assets: AssetsRecord) {
  switch (tx.type) {
    case TRANSACTION_TYPE.ISSUE:
      return [
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
        ),
      ];
    case TRANSACTION_TYPE.TRANSFER: {
      const asset = assets[tx.assetId ?? 'WAVES'];
      invariant(asset);
      return [new Money(new BigNumber(0).sub(tx.amount), new Asset(asset))];
    }
    case TRANSACTION_TYPE.REISSUE: {
      const asset = assets[tx.assetId ?? 'WAVES'];
      invariant(asset);
      return [new Money(tx.quantity, new Asset(asset))];
    }
    case TRANSACTION_TYPE.BURN: {
      const asset = assets[tx.assetId ?? 'WAVES'];
      invariant(asset);
      return [new Money(new BigNumber(0).sub(tx.amount), new Asset(asset))];
    }
    case TRANSACTION_TYPE.LEASE:
      return [
        new Money(new BigNumber(0).sub(tx.amount), new Asset(assets.WAVES)),
      ];
    case TRANSACTION_TYPE.CANCEL_LEASE:
      return [new Money(tx.lease.amount, new Asset(assets.WAVES))];
    case TRANSACTION_TYPE.MASS_TRANSFER: {
      const asset = assets[tx.assetId ?? 'WAVES'];
      invariant(asset);

      return [
        new Money(
          new BigNumber(0).sub(
            BigNumber.sum(...tx.transfers.map(t => t.amount)),
          ),
          new Asset(asset),
        ),
      ];
    }
    case TRANSACTION_TYPE.INVOKE_SCRIPT:
      return tx.payment.map(p => {
        const asset = assets[p.assetId ?? 'WAVES'];
        invariant(asset);
        return new Money(new BigNumber(0).sub(p.amount), new Asset(asset));
      });
    default:
      return [];
  }
}

export function TransactionPackageCard({
  className,
  collapsed,
  message,
}: {
  className?: string;
  collapsed?: boolean;
  message: MessageOfType<'transactionPackage'>;
}) {
  const { t } = useTranslation();
  const assets = usePopupSelector(state => state.assets);

  const fees = Object.values(
    message.data.reduce<Record<string, Money>>((acc, tx) => {
      const assetId = ('feeAssetId' in tx ? tx.feeAssetId : null) ?? 'WAVES';
      const asset = assets[assetId];
      invariant(asset);

      const assetInstance = new Asset(asset);

      acc[assetId] = (acc[assetId] ?? new Money(0, assetInstance)).add(
        new Money(tx.fee, assetInstance),
      );

      return acc;
    }, {}),
  );

  return (
    <div
      className={clsx(
        className,
        transactionsStyles.transactionCard,
        transactionsStyles.groupTx,
      )}
    >
      <div className={transactionsStyles.groupBottom} />

      <div className={transactionsStyles.groupEffect}>
        <div className={clsx(transactionsStyles.cardHeader, styles.cardHeader)}>
          <div className={transactionsStyles.txIcon}>
            <MessageIcon type="transactionPackage" />
          </div>

          <div>
            <div className="basic500 body3 margin-min">
              {message.title && collapsed
                ? message.title
                : t('transactions.packTransactionGroup')}
            </div>

            <h1
              className="headline1 margin-main"
              data-testid="packageCountTitle"
            >
              {message.data.length} {t('transactions.packTransactions')}
            </h1>

            {message.data.flatMap(tx =>
              getBalanceChanges(tx, assets)
                .filter(amount => !amount.getTokens().eq(0))
                .map((amount, index) => {
                  const coins = amount.getCoins();

                  return (
                    <Balance
                      key={index}
                      addSign={coins.gt(0) ? '+' : undefined}
                      balance={amount}
                      className={styles.amountItem}
                      data-testid="packageAmountItem"
                      showAsset
                      showUsdAmount
                      split
                    />
                  );
                }),
            )}
          </div>
        </div>

        {!collapsed && (
          <div className={styles.fee}>
            <div className="basic500 body3 margin-min margin-main-top">
              {t('transactions.packTransactionsFees')}
            </div>

            <div className="margin-min">
              <div className="margin-main">
                {fees.map((fee, index) => (
                  <div key={index}>
                    <Balance
                      data-testid="packageFeeItem"
                      balance={fee}
                      isShortFormat
                      showAsset
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TransactionPackageScreen({
  message,
  selectedAccount,
}: {
  message: MessageOfType<'transactionPackage'>;
  selectedAccount: PreferencesAccount;
}) {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const transactionListTitleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const transactionListTitle = transactionListTitleRef.current;

    if (!isOpen || !transactionListTitle) {
      return;
    }

    transactionListTitle.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [isOpen]);

  const { account, data, ext_uuid, id, input, status, timestamp } = message;

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className={styles.screenCard}>
          <TransactionPackageCard message={message} />
        </div>

        <div
          ref={transactionListTitleRef}
          className={styles.transactionListTitle}
        >
          {t('transactions.details')}
        </div>

        {isOpen &&
          data.map((item, index) => {
            const msg: MessageOfType<'transaction'> = {
              account,
              broadcast: false,
              data: item,
              err: '',
              ext_uuid,
              id,
              input: {
                account,
                broadcast: false,
                data: input.data[index],
                type: 'transaction',
              },
              status,
              timestamp,
              type: 'transaction',
            };

            return (
              <div key={index} data-testid="packageItem">
                <TransactionCard message={msg} />
                <TxInfo message={msg} />
              </div>
            );
          })}

        <button
          className={styles.toggle}
          data-testid="packageDetailsToggle"
          type="button"
          onClick={() => {
            setIsOpen(prevState => !prevState);
          }}
        >
          <div className={styles.icons}>
            {data
              .slice()
              .reverse()
              .map((item, index) => (
                <MessageIcon
                  key={index}
                  className={styles.icon}
                  type={
                    {
                      [TRANSACTION_TYPE.ISSUE]: 'issue',
                      [TRANSACTION_TYPE.TRANSFER]: 'transfer',
                      [TRANSACTION_TYPE.REISSUE]: 'reissue',
                      [TRANSACTION_TYPE.BURN]: 'burn',
                      [TRANSACTION_TYPE.LEASE]: 'lease',
                      [TRANSACTION_TYPE.CANCEL_LEASE]: 'cancel-leasing',
                      [TRANSACTION_TYPE.ALIAS]: 'create-alias',
                      [TRANSACTION_TYPE.MASS_TRANSFER]: 'mass_transfer',
                      [TRANSACTION_TYPE.DATA]: 'data',
                      [TRANSACTION_TYPE.SET_SCRIPT]: 'set-script',
                      [TRANSACTION_TYPE.SPONSORSHIP]: 'sponsorship',
                      [TRANSACTION_TYPE.SET_ASSET_SCRIPT]: 'set-asset-script',
                      [TRANSACTION_TYPE.INVOKE_SCRIPT]: 'script_invocation',
                      [TRANSACTION_TYPE.UPDATE_ASSET_INFO]: 'updateAssetInfo',
                    }[item.type]
                  }
                />
              ))}
          </div>

          <div className={styles.toggleText}>
            {t(
              isOpen
                ? 'transactions.hideTransactions'
                : 'transactions.showTransactions',
            )}

            <i className={isOpen ? styles.arrowUp : styles.arrowDown} />
          </div>
        </button>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}
