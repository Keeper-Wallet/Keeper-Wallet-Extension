import clsx from 'clsx';
import { MessageFinal } from 'messages/_common/final';
import { MessageFooter } from 'messages/_common/footer';
import { MessageHeader } from 'messages/_common/header';
import { type PreferencesAccount } from 'preferences/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { type MessageOfType } from '../types';
import * as styles from './auth.module.css';

export function AuthCard({
  className,
  collapsed,
  message,
}: {
  className?: string;
  collapsed?: boolean;
  message: MessageOfType<'auth'>;
}) {
  const { t } = useTranslation();
  const [iconFailedToLoad, setIconFailedToLoad] = useState(false);

  const icon =
    message.data.data.icon &&
    new URL(
      message.data.data.icon,
      message.data.referrer || `https://${message.origin}`,
    ).toString();

  const name = message.data.data.name || message.origin;

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      <div>
        {collapsed ? (
          <>
            <div className={styles.smallCardContent}>
              <div
                className={clsx(
                  transactionsStyles.txIcon,
                  styles.authTxIconSmall,
                )}
              >
                {!icon || iconFailedToLoad ? (
                  <div
                    className={clsx(
                      'signin-icon',
                      transactionsStyles.txIcon,
                      styles.authTxIconSmall,
                    )}
                  />
                ) : (
                  <img
                    className={clsx(
                      transactionsStyles.txIcon,
                      styles.authTxIconSmall,
                    )}
                    src={icon}
                    onError={() => {
                      setIconFailedToLoad(true);
                    }}
                  />
                )}
              </div>

              <div>
                <div className="basic500 body3 margin-min origin-ellipsis">
                  {name}
                </div>

                <h1 className="headline1">
                  {t('transactions.allowAccessTitle')}
                </h1>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={transactionsStyles.txIconBig}>
              {!icon || iconFailedToLoad ? (
                <div
                  className={clsx('signin-icon', transactionsStyles.txIconBig)}
                />
              ) : (
                <img
                  className={transactionsStyles.txIconBig}
                  src={icon}
                  onError={() => {
                    setIconFailedToLoad(true);
                  }}
                />
              )}
            </div>

            <div className="body1 font700 margin-min center">{name}</div>
          </>
        )}
      </div>
    </div>
  );
}

export function AuthScreen({
  message,
  selectedAccount,
}: {
  message: MessageOfType<'auth'>;
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
          <AuthCard message={message} />
        </div>

        <div
          className={clsx(
            transactionsStyles.txRow,
            transactionsStyles.borderedBottom,
            'margin-main-big',
          )}
        >
          <div className="tx-title body3 basic500">
            {t('transactions.dataHash')}
          </div>

          <div className={transactionsStyles.txValue}>
            {message.messageHash}
          </div>
        </div>

        <div className={clsx('info-block', 'body3', 'basic500', 'left')}>
          <div>
            <i className="inactive-account-icon" />
          </div>

          <div>{t('sign.signAccessInfo')}</div>
        </div>
      </div>

      <MessageFooter message={message} />
    </div>
  );
}

export function AuthFinal({
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
        send: t('sign.authConfirmed'),
        approve: t('sign.authConfirmed'),
        reject: t('sign.authRejected'),
      }}
    />
  );
}
