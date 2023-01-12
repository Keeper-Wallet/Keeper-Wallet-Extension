import clsx from 'clsx';
import { TxDetailTabs } from 'messages/_common/detailTabs';
import { Expandable } from 'messages/_common/expandable';
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
import { Script } from '../_common/script';
import { MessageOfType, MessageTxSetAssetScript } from '../types';
import * as setAssetScriptStyles from './setAssetScript.module.css';

export function SetAssetScriptCard({
  className,
  collapsed,
  tx,
}: {
  className?: string;
  collapsed?: boolean;
  tx: MessageTxSetAssetScript;
}) {
  const { t } = useTranslation();
  const asset = usePopupSelector(state => state.assets[tx.assetId]);
  invariant(asset);

  return (
    <>
      <div className={clsx(transactionsStyles.transactionCard, className)}>
        <div className={transactionsStyles.cardHeader}>
          <div className={transactionsStyles.txIcon}>
            <MessageIcon type="set-asset-script" />
          </div>

          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.assetScriptTransaction')}
            </div>

            <h1 className="headline1">
              <span data-testid="setAssetScriptAsset">{asset.displayName}</span>
            </h1>
          </div>
        </div>

        <div className={setAssetScriptStyles.cardContent}>
          <Expandable allowExpanding={!collapsed} textToCopy={tx.script}>
            <Script script={tx.script} />
          </Expandable>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="font700 tag1 basic500 margin-min margin-main-top">
            {t('transactions.assetScriptWarningHeader')}
          </div>

          <div className="tag1 basic500 margin-main">
            {t('transactions.assetScriptWarningDescription')}
          </div>
        </>
      )}
    </>
  );
}

export function SetAssetScriptScreen({
  message,
  selectedAccount,
  tx,
}: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
  tx: MessageTxSetAssetScript;
}) {
  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div className={`${transactionsStyles.txScrollBox} transactionContent`}>
        <div className="margin-main">
          <SetAssetScriptCard tx={tx} />
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
