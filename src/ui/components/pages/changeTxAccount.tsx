import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import invariant from 'tiny-invariant';
import Background from 'ui/services/Background';

import {
  deleteNotifications,
  setActiveMessage,
  updateActiveState,
} from '../../../store/actions/notifications';
import { Button } from '../ui';
import { TransactionWallet } from '../wallets/TransactionWallet';
import * as styles from './styles/selectTxAccount.styl';

export function ChangeTxAccount() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();

  const messages = usePopupSelector(state => state.messages);
  const notifications = usePopupSelector(state => state.notifications);
  const selectedAccount = usePopupSelector(state => state.selectedAccount);
  invariant(selectedAccount);

  return (
    <div className={styles.content}>
      <TransactionWallet
        account={selectedAccount}
        className={styles.userWallet}
        hideButton
      >
        <div
          className={styles.closeIcon}
          onClick={() => {
            navigate(-1);
          }}
        />
      </TransactionWallet>

      <div className={styles.wrapper}>
        <div className="title1 margin-main-big">{t('sign.changeAccount')}</div>

        <div className="margin-main-large body1">
          {t('sign.changeAccountInfo')}
        </div>

        <Button
          type="submit"
          view="submit"
          onClick={() => {
            messages.forEach(message => {
              Background.reject(message.id);
            });

            Background.clearMessages();
            dispatch(setActiveMessage(undefined));

            dispatch(
              deleteNotifications(
                notifications.flatMap(item => item.map(x => x.id))
              )
            );

            dispatch(updateActiveState());
            Background.closeNotificationWindow();
          }}
        >
          {t('sign.switchAccount')}
        </Button>
      </div>
    </div>
  );
}
