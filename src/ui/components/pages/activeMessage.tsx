import clsx from 'clsx';
import { MessageStatus } from 'messages/types';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { setActiveMessage } from 'store/actions/notifications';
import invariant from 'tiny-invariant';
import Background from 'ui/services/Background';

import { MessageHeader } from '../../../messages/_common/header';
import { getMessageConfig } from '../../../messages/getMessageConfig';
import { clearMessagesStatus } from '../../../store/actions/localState';
import { Button } from '../ui/buttons/Button';
import * as styles from './activeMessage.module.css';
import { LoadingScreen } from './loadingScreen';
import * as transactionsStyles from './styles/transactions.module.css';

export function ActiveMessagePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();

  const activeMessage = usePopupSelector(state => state.activePopup?.msg);

  const balance = usePopupSelector(
    state =>
      state.selectedAccount && state.balances[state.selectedAccount.address],
  );

  const otherMessagesCount = usePopupSelector(
    state =>
      state.messages.filter(item => item.id !== state.activePopup?.msg?.id)
        .length,
  );

  const notificationsCount = usePopupSelector(
    state => state.notifications.length,
  );

  const selectedAccount = usePopupSelector(state => state.selectedAccount);

  useEffect(() => {
    if (
      activeMessage &&
      activeMessage.type === 'authOrigin' &&
      activeMessage.status !== MessageStatus.UnApproved &&
      otherMessagesCount + notificationsCount > 0
    ) {
      dispatch(clearMessagesStatus());
    }
  }, [activeMessage, dispatch, notificationsCount, otherMessagesCount]);

  if (!activeMessage || !balance) {
    return <LoadingScreen />;
  }

  invariant(selectedAccount);

  const {
    card: Card,
    final: FinalComponent,
    screen: Message,
  } = getMessageConfig(activeMessage);

  if (activeMessage.status === MessageStatus.UnApproved) {
    return (
      <Message message={activeMessage} selectedAccount={selectedAccount} />
    );
  }

  const explorerUrls = new Map([
    ['W', 'wavesexplorer.com'],
    ['T', 'testnet.wavesexplorer.com'],
    ['S', 'stagenet.wavesexplorer.com'],
    ['custom', 'wavesexplorer.com/custom'],
  ]);

  const isApproved =
    activeMessage.status === MessageStatus.Signed ||
    activeMessage.status === MessageStatus.Published;

  const isRejected =
    activeMessage.status === MessageStatus.Rejected ||
    activeMessage.status === MessageStatus.RejectedForever;

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader
        message={activeMessage}
        selectedAccount={selectedAccount}
      />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        {activeMessage.status !== MessageStatus.Failed && (
          <div
            className={clsx(transactionsStyles.txBigIcon, 'margin-main', {
              'tx-reject-icon': isRejected,
              'tx-approve-icon': isApproved,
            })}
          />
        )}

        <div className="margin-main-top margin-main-big">
          {activeMessage.status !== MessageStatus.Failed && (
            <div className="center">
              <FinalComponent
                isApprove={isApproved}
                isReject={isRejected}
                isSend={'broadcast' in activeMessage && activeMessage.broadcast}
              />
            </div>
          )}

          {activeMessage.status === MessageStatus.Failed && (
            <div className={clsx(styles.errorWrapper, 'plate')}>
              <h2 className={clsx(styles.errorHeading, 'error-icon')}>
                {t('sign.someError')}
              </h2>

              <pre className={styles.errorMessage}>{activeMessage.err}</pre>
            </div>
          )}
        </div>

        <Card message={activeMessage} collapsed={false} />

        {activeMessage.type === 'transaction' &&
          activeMessage.status === MessageStatus.Published && (
            <div className="center margin-main-big-top">
              <a
                className="link black"
                href={`https://${explorerUrls.get(
                  explorerUrls.has(selectedAccount.networkCode)
                    ? selectedAccount.networkCode
                    : 'custom',
                )}/tx/${activeMessage.data.id}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t('sign.viewTransaction')}
              </a>
            </div>
          )}

        {activeMessage.type === 'order' && (
          <div className={clsx(transactionsStyles.txRow, 'margin-main-top')}>
            <div className="basic500 tx-title tag1">
              {t('transactions.orderId')}
            </div>

            <div className="black">{activeMessage.data.id}</div>
          </div>
        )}
      </div>

      <div
        className={clsx(transactionsStyles.txButtonsWrapper, {
          'buttons-wrapper': otherMessagesCount + notificationsCount > 1,
        })}
      >
        {(otherMessagesCount + notificationsCount > 1 ||
          notificationsCount !== 0) && (
          <Button
            type="button"
            onClick={() => {
              dispatch(setActiveMessage(undefined));
            }}
          >
            {t('sign.pendingList')}
          </Button>
        )}

        {otherMessagesCount !== 0 && (
          <Button
            type="button"
            view="submit"
            onClick={() => {
              dispatch(clearMessagesStatus());
            }}
          >
            {t('sign.nextTransaction')}
          </Button>
        )}

        {otherMessagesCount === 0 && notificationsCount === 0 && (
          <Button
            data-testid="closeTransaction"
            id="close"
            type="button"
            onClick={() => {
              if (window.location.pathname === '/notification.html') {
                Background.closeNotificationWindow();
              } else {
                dispatch(setActiveMessage(undefined));
                navigate('/');
              }
            }}
          >
            {activeMessage.status === MessageStatus.Failed
              ? t('sign.understand')
              : t('sign.close')}
          </Button>
        )}
      </div>
    </div>
  );
}
