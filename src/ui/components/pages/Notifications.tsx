import * as React from 'react';
import { connect } from 'react-redux';
import { Button, DateFormat, Input } from 'ui/components/ui';
import {
  withTranslation,
  WithTranslation,
  useTranslation,
} from 'react-i18next';
import {
  deleteNotifications,
  setActiveNotification,
  setShowNotification,
} from '../../actions/notifications';
import { WithNavigate, withNavigate } from '../../router';
import { PAGES } from '../../pages';
import { TransactionWallet } from '../wallets/TransactionWallet';
import * as styles from './styles/messageList.styl';
import { LoadingScreen } from './loadingScreen';
import { AppState } from 'ui/store';
import { NotificationsStoreItem } from 'notifications/types';
import { PreferencesAccount } from 'preferences/types';
import { PermissionObject, PermissionValue } from 'permissions/types';
import { MessageStoreItem } from 'messages/types';
import Background from 'ui/services/Background';

const NotificationItem = ({
  notification,
}: {
  notification: NotificationsStoreItem;
}) => {
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

interface StateProps {
  selectedAccount: Partial<PreferencesAccount>;
  activeNotification: NotificationsStoreItem[] | null;
  origins: Record<string, PermissionValue[]>;
  messages: MessageStoreItem[];
  notifications: NotificationsStoreItem[][];
}

interface DispatchProps {
  setShowNotification: (permissions: {
    origin: string;
    canUse: boolean | null;
  }) => void;
  deleteNotifications: (
    ids:
      | string[]
      | {
          ids: string[];
          next: NotificationsStoreItem[] | null;
        }
  ) => void;
}

type Props = WithTranslation & StateProps & DispatchProps & WithNavigate;

interface State {
  canShowNotify?: boolean;
  messages?: MessageStoreItem[];
  activeNotification?: NotificationsStoreItem[] | null;
  showToList?: boolean;
  origin?: string;
  hasMessages?: boolean;
  hasNotifications?: boolean;
  notifications?: NotificationsStoreItem[][];
  showClose?: boolean;
  loading?: boolean;
}

class NotificationsComponent extends React.Component<Props, State> {
  state: State = {};

  static getDerivedStateFromProps(
    props: Readonly<Props>
  ): Partial<State> | null {
    const { origins, activeNotification, messages, notifications } = props;
    if (!activeNotification && notifications.length) {
      props.navigate(PAGES.MESSAGES_LIST);
      return { loading: true };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const origin = activeNotification![0].origin;
    const perms = origins[origin] || [];
    const useNotifications = perms.find(
      item => item && (item as PermissionObject).type === 'useNotifications'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inWhiteList = (origins[origin] || []).includes('whiteList' as any);
    const useNotify =
      useNotifications && (useNotifications as PermissionObject).canUse;
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
    Background.closeNotificationWindow();
  };

  toListHandler = () => {
    (this._deleteMessages(null) as unknown as Promise<void>).then(() =>
      this.props.navigate(PAGES.MESSAGES_LIST)
    );
  };

  toggleCanShowHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const canUse = e.target.checked;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.props.setShowNotification({ origin: this.state.origin!, canUse });
  };

  nextHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const nextNotification = this.state.notifications!.filter(
      ([item]) => item.origin !== this.state.origin
    )[0];
    this._deleteMessages(nextNotification || null);
  };

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
      return <LoadingScreen />;
    }

    return (
      <div className={`${styles.messageList} ${styles.messageListInner}`}>
        <div className={styles.walletWrapper}>
          <TransactionWallet
            type="clean"
            onSelect={() => {
              this.props.navigate(PAGES.CHANGE_TX_ACCOUNT);
            }}
            account={this.props.selectedAccount}
            hideButton={false}
          />
        </div>

        <div className={styles.messageListScrollBox}>
          {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            activeNotification!.map(notification => (
              <NotificationItem
                notification={notification}
                key={notification.id}
              />
            ))
          }

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

  _deleteMessages(nexActive: NotificationsStoreItem[] | null) {
    return this.props.deleteNotifications({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ids: this.state.activeNotification!.map(({ id }) => id),
      next: nexActive,
    });
  }
}

const mapStateToProps = function (store: AppState): StateProps {
  return {
    selectedAccount: store.selectedAccount,
    activeNotification: store.activePopup && store.activePopup.notify,
    origins: store.origins,
    messages: store.messages,
    notifications: store.notifications,
  };
};

const actions = {
  setActiveNotification,
  setShowNotification,
  deleteNotifications,
};

export const Notifications = connect(
  mapStateToProps,
  actions
)(withTranslation()(withNavigate(NotificationsComponent)));
