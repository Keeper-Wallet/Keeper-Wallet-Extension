import clsx from 'clsx';
import { DataEntries } from 'messages/_common/dataEntries';
import { Expandable } from 'messages/_common/expandable';
import { MessageFinal } from 'messages/_common/final';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { MessageOfType } from '../types';
import * as styles from './customData.module.css';

export function CustomDataCard({
  className,
  collapsed,
  message,
}: {
  className?: string;
  collapsed?: boolean;
  message: MessageOfType<'customData'>;
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div className={transactionsStyles.cardHeader}>
        <div className={transactionsStyles.txIcon}>
          <MessageIcon type="authOrigin" small />
        </div>

        <div>
          <div className="basic500 body3 margin-min">
            {t('sign.customData')}
          </div>

          <h1 className="headline1">{t('sign.customDataName')}</h1>
        </div>
      </div>

      <div className={styles.cardContent}>
        {message.data.version === 1 ? (
          <Expandable
            allowExpanding={!collapsed}
            textToCopy={message.data.binary}
          >
            <pre data-testid="customDataBinary">{message.data.binary}</pre>
          </Expandable>
        ) : (
          <Expandable
            allowExpanding={!collapsed}
            textToCopy={JSON.stringify(message.data.data, null, 2)}
          >
            <DataEntries entries={message.data.data} />
          </Expandable>
        )}
      </div>
    </div>
  );
}

export function CustomDataScreen({
  message,
  selectAccount,
  selectedAccount,
}: {
  message: MessageOfType<'customData'>;
  selectAccount: () => void;
  selectedAccount: PreferencesAccount;
}) {
  const { t } = useTranslation();

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader
        message={message}
        selectAccount={selectAccount}
        selectedAccount={selectedAccount}
      />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <CustomDataCard message={message} />
        </div>

        <div>
          <div className={transactionsStyles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.hash')}
            </div>

            <div className={transactionsStyles.txValue}>
              {message.data.hash}
            </div>
          </div>
        </div>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}

export function CustomDataFinal({
  isApprove,
  isReject,
  isSend,
}: {
  isApprove: boolean;
  isReject: boolean;
  isSend: boolean | undefined;
}) {
  const { t } = useTranslation();

  return (
    <MessageFinal
      isApprove={isApprove}
      isReject={isReject}
      isSend={isSend}
      messages={{
        send: t('sign.customDataSent'),
        approve: t('sign.customDataConfirmed'),
        reject: t('sign.customDataFailed'),
      }}
    />
  );
}
