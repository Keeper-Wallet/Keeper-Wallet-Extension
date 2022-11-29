import { AssetsRecord } from 'assets/types';
import { MessageStoreItem } from 'messages/types';
import { NotificationsStoreItem } from 'notifications/types';
import { PopupState } from 'popup/store/types';
import { PreferencesAccount } from 'preferences/types';
import { Component } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { getAsset } from '../../../store/actions/assets';
import { approve, clearMessages } from '../../../store/actions/messages';
import {
  deleteNotifications,
  setActiveMessage,
  setActiveNotification,
} from '../../../store/actions/notifications';
import { NotificationCard } from '../notifications';
import { getConfigByTransaction } from '../transactions';
import { Button } from '../ui';
import { TransactionWallet } from '../wallets/TransactionWallet';
import { LoadingScreen } from './loadingScreen';
import * as styles from './styles/messageList.styl';

const Messages = ({ messages, assets, onSelect }: IProps) => {
  return (
    <>
      {messages.map(message => {
        try {
          const config = getConfigByTransaction(message);
          const Card = config.card;
          return (
            <div key={message.id} onClick={() => onSelect(message)}>
              <Card
                className={styles.cardItem}
                message={message}
                assets={assets}
                collapsed
              />
            </div>
          );
        } catch (e) {
          return null;
        }
      })}
    </>
  );
};

interface IProps {
  messages: MessageStoreItem[];
  assets: AssetsRecord;
  onSelect: (message: MessageStoreItem | null) => void;
}

const Notifications = ({
  notifications,
  onShow,
  onDelete,
}: {
  notifications: NotificationsStoreItem[][];
  onShow: (notification: NotificationsStoreItem[] | null) => void;
  onDelete: (ids: string[]) => void;
}) => {
  return (
    <>
      {notifications.map(items => {
        const group = [...items].reverse();
        try {
          return (
            <div key={group[0].origin} className={styles.cardItem}>
              <NotificationCard
                onShow={onShow}
                notifications={group}
                collapsed
                deleteNotifications={onDelete}
              />
            </div>
          );
        } catch (e) {
          return null;
        }
      })}
    </>
  );
};

interface StateProps {
  selectedAccount: PreferencesAccount | undefined;
  assets: AssetsRecord;
  messages: MessageStoreItem[];
  notifications: NotificationsStoreItem[][];
}

interface DispatchProps {
  setActiveNotification: (
    notification: NotificationsStoreItem[] | null
  ) => void;
  setActiveMessage: (message: MessageStoreItem | null) => void;
  deleteNotifications: (ids: string[]) => void;
  getAsset: (assetId: string) => void;
}

type Props = WithTranslation & StateProps & DispatchProps;

interface State {
  messages?: Props['messages'];
  assets?: Props['assets'];
  notifications?: Props['notifications'];
  loading: boolean;
}

class MessageListComponent extends Component<Props, State> {
  state: State = { loading: true };

  static getDerivedStateFromProps(
    props: Readonly<Props>
  ): Partial<State> | null {
    const { messages, assets, notifications } = props;
    const needAssets = MessageListComponent.getAssets(messages, assets);
    needAssets.forEach(id => props.getAsset(id));

    if (needAssets.length > 0) {
      return { loading: true };
    }

    return { messages, assets, notifications, loading: false };
  }

  static getAssets(
    messages: MessageStoreItem[] = [],
    assetsHash: AssetsRecord
  ) {
    const assets = messages.reduce((acc, message) => {
      const { data } = message;
      const tx = ('data' in data && data.data) || data;
      const config = getConfigByTransaction(message);
      const assetIds = config.getAssetsId(tx);
      assetIds.forEach(item => {
        if (!assetsHash[item]) {
          acc[item] = null;
        }
      });
      return acc;
    }, Object.create(null));

    return Object.keys(assets);
  }

  readonly selectMessageHandler = (message: MessageStoreItem | null) => {
    this.props.setActiveMessage(message);
  };

  readonly deleteNotifications = (ids: string[]) => {
    this.props.deleteNotifications(ids);
  };

  readonly deleteAll = () => {
    const ids = this.props.notifications.reduce((acc, item) => {
      return [...acc, ...item.map(({ id }) => id)];
    }, [] as string[]);
    this.props.deleteNotifications(ids);
  };

  readonly selectNotificationHandler = (
    notification: NotificationsStoreItem[] | null
  ) => this.props.setActiveNotification(notification);

  render() {
    if (this.state.loading) {
      return <LoadingScreen />;
    }

    const { t, messages, notifications, assets } = this.props;
    const hasNotifications = notifications.length > 0;
    const hasMessages = messages.length > 0;

    return (
      <div className={`${styles.messageList}`}>
        <div className={styles.messageListHeader}>
          <div className={styles.messageListTitle}>
            <span className={styles.messageListCounter}>
              {messages.length + notifications.length}
            </span>
            <span className="headline3">{t('messageList.notifications')}</span>
          </div>
        </div>

        <div className={styles.walletWrapper}>
          <TransactionWallet
            type="clean"
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            account={this.props.selectedAccount!}
            hideButton
          />
        </div>

        <div className={styles.messageListScrollBox}>
          {hasNotifications && (
            <>
              <div className="flex basic500">
                <div>{t('messageList.messages')}</div>
                <Button
                  id="clearAllMessages"
                  type="button"
                  view="transparent"
                  onClick={this.deleteAll}
                  className={`${styles.clearAllBtn} body3 basic500`}
                >
                  {t('messageList.clearAllMessages')}
                </Button>
              </div>

              <div className="basic-500 margin-main-big">
                <Notifications
                  notifications={notifications}
                  onShow={this.selectNotificationHandler}
                  onDelete={this.deleteNotifications}
                />
              </div>
            </>
          )}

          {hasMessages && (
            <>
              <div className="basic500">{t('messageList.pendingConfirm')}</div>

              <div className="basic-500 margin1">
                <Messages
                  messages={messages}
                  assets={assets}
                  onSelect={this.selectMessageHandler}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(store: PopupState): StateProps {
  return {
    selectedAccount: store.selectedAccount,
    assets: store.assets,
    messages: store.messages,
    notifications: store.notifications,
  };
}

const actions = {
  setActiveNotification,
  setActiveMessage,
  deleteNotifications,
  clearMessages,
  getAsset,
  approve,
};

export const MessageList = connect(
  mapStateToProps,
  actions
)(withTranslation()(MessageListComponent));
