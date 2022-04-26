import * as React from 'react';
import { connect } from 'react-redux';
import { Button, DateFormat, Input } from 'ui/components/ui';
import {
  withTranslation,
  WithTranslation,
  useTranslation,
} from 'react-i18next';
import {
  closeNotificationWindow,
  deleteNotifications,
  setActiveNotification,
  setShowNotification,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { TransactionWallet } from '../wallets/TransactionWallet';
import * as styles from './styles/messageList.styl';
import { Intro } from './Intro';
import { Message } from 'ui/components/transactions/BaseTransaction';

export interface Notification {
  id: string;
  origin: string;
  title: string;
  message: string;
  timestamp: number;
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { t } = useTranslation();
  return (
    <div className={`margin-main-big`}>
      <div className={`${styles.messageItemInner} margin-2`}>
        <div className="flex">
          <div className={styles.messageIcon} />
          <div className={styles.messageTitle}>
            <div className="basic500">
              {notification && notification.origin}
            </div>
            <h2 className="">{notification && notification.title}</h2>
          </div>
        </div>
        <div className={styles.messageText}>
          {notification && notification.message}
        </div>
      </div>
      <div className={styles.timestamp}>
        <div className="basic500 margin-min">{t('notifications.time')}</div>
        <DateFormat date={notification.timestamp} />
      </div>
    </div>
  );
};

interface Props extends WithTranslation {
  selectedAccount: Account;
  origins: unknown;
  activeNotification: Notification;
  messages: unknown[];
  notifications: Notification[];

  setTab: (tab: string) => void;
  closeNotificationWindow: () => void;
  setShowNotification: (permissions: unknown) => void;
  deleteNotifications: (ids: unknown[]) => void;
}

interface State {
  canShowNotify: boolean;
  messages: Message[];
  activeNotification: unknown[];
  showToList: boolean;
  origin: unknown;
  hasMessages: boolean;
  hasNotifications: boolean;
  notifications: unknown[];
  showClose: boolean;
  loading: boolean;
}

class NotificationsComponent extends React.Component<Props, State> {
  readonly state = {} as State;
  readonly props;

  static getDerivedStateFromProps(props) {
    const { origins, activeNotification, messages, notifications } = props;
    if (!activeNotification && notifications.length) {
      props.setTab(PAGES.MESSAGES_LIST);
      return { loading: true };
    }

    const origin = activeNotification[0].origin;
    const perms = origins[origin] || [];
    const useNotifications = perms.find(
      item => item && item.type === 'useNotifications'
    );
    const inWhiteList = (origins[origin] || []).includes('whiteList');
    const useNotify = useNotifications && useNotifications.canUse;
    const canShowNotify = useNotify || (useNotify == null && inWhiteList);
    const hasMessages = messages.length > 0;
    const hasNotifications =
      notifications.filter(([item]) => item.origin !== origin).length > 0;
    const showToList =
      hasMessages || (hasNotifications && notifications.length > 2);

    return {
      canShowNotify,
      messages,
      activeNotification,
      showToList,
      origin,
      hasMessages,
      hasNotifications,
      notifications,
      showClose: !hasNotifications,
      loading: false,
    };
  }

  closeHandler = () => {
    this._deleteMessages(null);
    this.props.closeNotificationWindow();
  };

  toListHandler = () => {
    this._deleteMessages(null).then(() =>
      this.props.setTab(PAGES.MESSAGES_LIST)
    );
  };

  toggleCanShowHandler = e => {
    const canUse = e.target.checked;
    this.props.setShowNotification({ origin: this.state.origin, canUse });
  };

  nextHandler = () => {
    const nextNotification = this.state.notifications.filter(
      ([item]) => item.origin !== this.state.origin
    )[0];
    this._deleteMessages(nextNotification || null);
  };

  selectAccountHandler = () => this.props.setTab(PAGES.CHANGE_TX_ACCOUNT);

  componentDidCatch() {
    this.toListHandler();
  }

  render() {
    const { t } = this.props;
    const {
      activeNotification,
      showToList,
      hasNotifications,
      showClose,
      loading,
    } = this.state;

    if (loading) {
      return <Intro />;
    }

    return (
      <div className={`${styles.messageList} ${styles.messageListInner}`}>
        <div className={styles.walletWrapper}>
          <TransactionWallet
            type="clean"
            onSelect={this.selectAccountHandler}
            account={this.props.selectedAccount}
            hideButton={false}
          />
        </div>

        <div className={styles.messageListScrollBox}>
          {activeNotification.map((notification: Notification) => (
            <NotificationItem
              notification={notification}
              key={notification.id}
            />
          ))}

          <div
            className={`margin-main-big margin-main-big-top flex ${styles.allowNotification}`}
          >
            <Input
              id="checkbox_noshow"
              type={'checkbox'}
              checked={this.state.canShowNotify}
              onChange={this.toggleCanShowHandler}
            />
            <label htmlFor="checkbox_noshow">
              {t('notifications.allowSending')}
            </label>
          </div>
        </div>

        <div className={`${styles.notificationButtons} buttons-wrapper`}>
          {showToList && (
            <Button type="button" onClick={this.toListHandler}>
              {t('notifications.toListBtn')}
            </Button>
          )}

          {hasNotifications && showToList && (
            <div className={styles.buttonsSeparator} />
          )}

          {hasNotifications && (
            <Button type="submit" view="submit" onClick={this.nextHandler}>
              {t('notifications.nextBtn')}
            </Button>
          )}

          {showClose && (hasNotifications || showToList) && (
            <div className={styles.buttonsSeparator} />
          )}

          {showClose && (
            <Button
              id="closeNotification"
              type="button"
              onClick={this.closeHandler}
            >
              {t('notifications.closeBtn')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  _deleteMessages(nexActive) {
    return this.props.deleteNotifications({
      ids: this.state.activeNotification.map(({ id }) => id),
      next: nexActive,
    });
  }
}

const mapStateToProps = function (store) {
  return {
    selectedAccount: store.selectedAccount,
    activeNotification: store.activePopup && store.activePopup.notify,
    origins: store.origins,
    messages: store.messages,
    notifications: store.notifications,
  };
};

const actions = {
  closeNotificationWindow,
  setActiveNotification,
  setShowNotification,
  deleteNotifications,
};

export const Notifications = connect(
  mapStateToProps,
  actions
)(withTranslation()(NotificationsComponent));
