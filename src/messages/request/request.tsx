import clsx from 'clsx';
import { MessageFinal } from 'messages/_common/final';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { type Message, type MessageOfType } from 'messages/types';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import * as styles from './request.module.css';

export function RequestCard({
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
      <div>
        {collapsed ? (
          <>
            <div className={styles.smallCardContent}>
              <div className={transactionsStyles.txIcon}>
                <MessageIcon type="matcher_orders" small />
              </div>

              <div>
                <div className="basic500 body3 margin-min origin-ellipsis">
                  {message.origin}
                </div>

                <h1 className="headline1">
                  {t('transactions.signRequestMatcher')}
                </h1>
              </div>
            </div>
          </>
        ) : (
          <div className={transactionsStyles.txIconBig}>
            <MessageIcon type="matcher_orders" />
          </div>
        )}
      </div>
    </div>
  );
}

export function RequestScreen({
  message,
  selectedAccount,
}: {
  message: MessageOfType<'request'>;
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
          <RequestCard message={message} />
        </div>

        <div className={transactionsStyles.txRow}>
          <div className="tx-title body3 basic500">
            {t('transactions.matcherTimeStamp')}
          </div>

          <div className={transactionsStyles.txValue}>
            {message.data.data.timestamp}
          </div>
        </div>

        <div className={transactionsStyles.txRow}>
          <div className="tx-title body3 basic500">
            {t('transactions.dataHash')}
          </div>

          <div className={transactionsStyles.txValue}>
            {message.messageHash}
          </div>
        </div>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}

export function RequestFinal({
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
        send: t('sign.matcherSend'),
        approve: t('sign.matcherConfirmed'),
        reject: t('sign.matcherRejected'),
      }}
    />
  );
}
