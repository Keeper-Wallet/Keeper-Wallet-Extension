import clsx from 'clsx';
import { MessageFinal } from 'messages/_common/final';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { DateFormat } from '../../ui/components/ui';
import { Message, MessageOfType } from '../types';
import * as styles from './wavesAuth.module.css';

export function WavesAuthCard({
  className,
  collapsed,
  message,
}: {
  className?: string;
  collapsed?: boolean;
  message: Message;
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      {collapsed ? (
        <>
          <div className={styles.smallCardContent}>
            <div className={transactionsStyles.txIcon}>
              <MessageIcon type="authOrigin" small />
            </div>

            <div>
              <div className="basic500 body3 margin-min origin-ellipsis">
                {message.origin}
              </div>

              <h1 className="headline1">
                {t('transactions.signRequestWavesAuth')}
              </h1>
            </div>
          </div>
        </>
      ) : (
        <div className={transactionsStyles.txIconBig}>
          <MessageIcon type="authOrigin" />
        </div>
      )}

      {!collapsed && (
        <div className={styles.cardContent}>
          <div className={styles.originAddress}>{message.origin}</div>

          {t('transactions.originWarning')}
        </div>
      )}
    </div>
  );
}

export function WavesAuthScreen({
  message,
  selectedAccount,
}: {
  message: MessageOfType<'wavesAuth'>;
  selectedAccount: PreferencesAccount;
}) {
  const { t } = useTranslation();

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <div className="margin-main">
          <WavesAuthCard message={message} />
        </div>

        <div>
          <div className={transactionsStyles.txRow}>
            <div className="tx-title body3 basic500">
              {t('transactions.wavesAuthTimeStamp')}
            </div>

            <div className="fullwidth">
              <DateFormat
                date={message.data.timestamp}
                showRaw
                className="fullwidth"
              />
            </div>
          </div>

          <div className={transactionsStyles.txRow}>
            <div className="tx-title body3 basic500">
              {t('transactions.publicKey')}
            </div>

            <div className={transactionsStyles.txValue}>
              {message.data.publicKey}
            </div>
          </div>

          <div className={transactionsStyles.txRow}>
            <div className="tx-title body3 basic500">
              {t('transactions.dataHash')}
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

export function WavesAuthFinal({
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
        send: t('sign.wavesAuthConfirmed'),
        approve: t('sign.wavesAuthConfirmed'),
        reject: t('sign.authRejected'),
      }}
    />
  );
}
