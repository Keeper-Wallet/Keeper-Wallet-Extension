import clsx from 'clsx';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

import { MessageWallet } from '../../../messages/_common/wallet';
import { getMessageConfig } from '../../../messages/getMessageConfig';
import {
  deleteNotifications,
  setActiveMessage,
  setActiveNotification,
} from '../../../store/actions/notifications';
import { Button } from '../ui/buttons/Button';
import * as styles from './messagesAndNotifications.module.css';
import * as transactionsStyles from './styles/transactions.module.css';

export function MessagesAndNotificationsPage() {
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();
  const messages = usePopupSelector(state => state.messages);
  const notifications = usePopupSelector(state => state.notifications);
  const selectedAccount = usePopupSelector(state => state.selectedAccount);
  invariant(selectedAccount);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.messageCount}>
          {messages.length + notifications.length}
        </span>

        <span className="headline3">{t('messageList.notifications')}</span>
      </header>

      <header className={styles.walletWrapper}>
        <MessageWallet account={selectedAccount} />
      </header>

      <div className={styles.scrollBox}>
        {notifications.length !== 0 && (
          <>
            <div className="flex basic500">
              <div>{t('messageList.messages')}</div>

              <Button
                className={clsx(styles.clearAllBtn, 'body3 basic500')}
                id="clearAllMessages"
                type="button"
                view="transparent"
                onClick={() => {
                  dispatch(
                    deleteNotifications(
                      notifications.flatMap(item => item.map(x => x.id)),
                    ),
                  );
                }}
              >
                {t('messageList.clearAllMessages')}
              </Button>
            </div>

            <div className="margin-main-big">
              {notifications.map(items => {
                const group = items.slice().reverse();

                return (
                  <div key={group[0].origin} className={styles.cardItem}>
                    <div
                      className={clsx(
                        styles.notificationCard,
                        transactionsStyles.transactionCard,
                        { [transactionsStyles.groupTx]: group.length > 1 },
                      )}
                    >
                      {group.length > 1 && (
                        <div className={transactionsStyles.groupBottom} />
                      )}

                      <div className={transactionsStyles.groupEffect}>
                        <div
                          className={transactionsStyles.cardHeader}
                          onClick={() => {
                            dispatch(setActiveNotification(group));
                          }}
                        >
                          <div className={styles.messageTransactionIcon} />

                          <div className="grow">
                            <div
                              className={clsx(
                                styles.notificationEllipsis,
                                'basic500 body3 margin-min',
                              )}
                            >
                              {group[0].origin}
                            </div>

                            <h2
                              className={clsx(
                                styles.notificationEllipsis,
                                'headline',
                              )}
                            >
                              {group.length > 1 ? (
                                <span>
                                  {group.length} {t('notifications.messages')}
                                </span>
                              ) : (
                                group[0].title
                              )}
                            </h2>
                          </div>

                          <Button
                            className={transactionsStyles.cardClose}
                            type="button"
                            view="transparent"
                            onClick={() => {
                              dispatch(
                                deleteNotifications(group.map(x => x.id)),
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {messages.length !== 0 && (
          <>
            <div className="basic500">{t('messageList.pendingConfirm')}</div>

            <div>
              {messages.map(message => {
                const { card: Card } = getMessageConfig(message);

                return (
                  <div
                    key={message.id}
                    className={styles.cardItem}
                    onClick={() => {
                      dispatch(setActiveMessage(message));
                    }}
                  >
                    <Card collapsed message={message} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
