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
import { Balance } from '../../ui/components/ui';
import { MessageOfType, MessageTxBurn } from '../types';

export function BurnCard({
  className,
  tx,
}: {
  className?: string;
  tx: MessageTxBurn;
}) {
  const { t } = useTranslation();
  const asset = usePopupSelector(state => state.assets[tx.assetId]);
  invariant(asset);

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="burn" />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('transactions.burn')}
          </div>

          <h1 className="headline1">
            <Balance
              data-testid="burnAmount"
              split
              addSign="-"
              showAsset
              balance={new Money(tx.amount, new Asset(asset))}
              showUsdAmount
            />
          </h1>
        </div>
      </div>
    </div>
  );
}

export function BurnScreen({
  message,
  selectAccount,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectAccount: () => void;
  selectedAccount: PreferencesAccount;
  tx: MessageTxBurn;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader
        message={message}
        selectedAccount={selectedAccount}
        selectAccount={selectAccount}
      />

      <div className={`${transactionsStyles.txScrollBox} transactionContent`}>
        <div className="margin-main">
          <BurnCard tx={tx} />
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
