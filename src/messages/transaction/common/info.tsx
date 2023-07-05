import { Asset, Money } from '@waves/data-entities';
import {
  type FeeOption,
  getFeeOptions,
  getSpendingAmountsForSponsorableTx,
  isEnoughBalanceForFeeAndSpendingAmounts,
} from 'fee/utils';
import { usePopupSelector } from 'popup/store/react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import Background from 'ui/services/Background';

import * as styles from '../../../ui/components/pages/styles/transactions.module.css';
import { DateFormat } from '../../../ui/components/ui';
import { Balance, Select, type SelectItem } from '../../../ui/components/ui';
import type { MessageOfType } from '../../types';

interface Props {
  message: MessageOfType<'transaction'>;
}

export function TxInfo({ message }: Props) {
  const { t } = useTranslation();

  const assets = usePopupSelector(state => state.assets);

  const balance = usePopupSelector(
    state =>
      state.selectedAccount && state.balances[state.selectedAccount.address],
  );

  const selectedAccount = usePopupSelector(state => state.selectedAccount);
  invariant(selectedAccount);

  const usdPrices = usePopupSelector(state => state.usdPrices);

  const initailFeeAsset =
    assets[
      ('initialFeeAssetId' in message.data && message.data.initialFeeAssetId) ||
        'WAVES'
    ];
  invariant(initailFeeAsset);

  let feeOptions: FeeOption[] = [];

  feeOptions =
    message.data.senderPublicKey === selectedAccount.publicKey
      ? getFeeOptions({
          assets,
          balance,
          initialFee: new Money(
            message.data.initialFee,
            new Asset(initailFeeAsset),
          ),
          txType: message.data.type,
          usdPrices,
        }).filter(option =>
          isEnoughBalanceForFeeAndSpendingAmounts({
            balance: option.assetBalance.balance,
            fee: option.money,
            spendingAmounts: getSpendingAmountsForSponsorableTx({
              assets,
              messageTx: message.data,
            }),
          }),
        )
      : [];

  const feeAsset =
    assets[
      ('feeAssetId' in message.data && message.data.feeAssetId) || 'WAVES'
    ];
  invariant(feeAsset);

  const fee = new Money(message.data.fee, new Asset(feeAsset));
  const assetBalance = balance?.assets?.[feeAsset.id];

  if (
    feeOptions.findIndex(opt => opt.money.asset.id === feeAsset.id) === -1 &&
    assetBalance
  ) {
    feeOptions = feeOptions.concat({
      assetBalance,
      money: fee,
    });
  }

  return (
    <div>
      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">{t('transactions.fee')}</div>

        <div className={styles.txValue}>
          <div data-testid="txFee">
            {feeOptions.length <= 1 ? (
              <Balance isShortFormat balance={fee} showAsset />
            ) : (
              <Select
                fill
                selectList={feeOptions.map(
                  (option): SelectItem<string> => ({
                    id: option.money.asset.id,
                    value: option.money.getTokens().toFixed(),
                    text: `${option.money.toFormat()} ${
                      option.money.asset.displayName
                    }`,
                  }),
                )}
                selected={feeAsset.id}
                onSelectItem={(id, tokens) => {
                  Background.updateTransactionFee(message.id, {
                    tokens,
                    assetId: id as string,
                  });
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">{t('transactions.txTime')}</div>

        <div className={styles.txValue}>
          <DateFormat date={message.data.timestamp} />
        </div>
      </div>

      <div className={styles.txRow}>
        <div className="tx-title tag1 basic500">{t('transactions.txid')}</div>
        <div className={styles.txValue}>{message.data.id}</div>
      </div>
    </div>
  );
}
