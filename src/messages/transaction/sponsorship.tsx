import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { TxInfo } from 'messages/transaction/common/info';
import { stringifyTransaction } from 'messages/utils';
import { usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Balance } from 'ui/components/ui/balance/Balance';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { type MessageOfType, type MessageTxSponsorship } from '../types';

export function SponsorshipCard({
  className,
  collapsed,
  tx,
}: {
  className?: string;
  collapsed?: boolean;
  tx: MessageTxSponsorship;
}) {
  const { t } = useTranslation();
  const asset = usePopupSelector(state => state.assets[tx.assetId]);
  invariant(asset);

  return (
    <>
      <div className={clsx(transactionsStyles.transactionCard, className)}>
        <div className={transactionsStyles.cardHeader}>
          <div className={transactionsStyles.txIcon}>
            <MessageIcon
              type={
                tx.minSponsoredAssetFee == null
                  ? 'sponsor_disable'
                  : 'sponsor_enable'
              }
            />
          </div>

          <div>
            <div
              className="basic500 body3 margin-min"
              data-testid="sponsorshipTitle"
            >
              {t(
                tx.minSponsoredAssetFee == null
                  ? 'transactions.clearSponsored'
                  : 'transactions.setSponsored',
              )}
            </div>

            <h1 className="headline1">
              {tx.minSponsoredAssetFee == null ? (
                <span data-testid="sponsorshipAsset">{asset.displayName}</span>
              ) : (
                <Balance
                  balance={new Money(tx.minSponsoredAssetFee, new Asset(asset))}
                  data-testid="sponsorshipAmount"
                  showAsset
                  showUsdAmount
                  split
                />
              )}
            </h1>
          </div>
        </div>
      </div>

      {!collapsed && tx.minSponsoredAssetFee != null && (
        <div className="tag1 basic500 margin-min margin-main-top">
          {t('transactions.amountPerTransaction')}
        </div>
      )}
    </>
  );
}

export function SponsorshipScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxSponsorship;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <SponsorshipCard tx={tx} />
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
