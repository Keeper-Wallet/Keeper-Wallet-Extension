import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import {
  approve,
  clearMessages,
  deleteNotifications,
  getAsset,
  reject,
  setActiveMessage,
  setActiveNotification,
} from '../../actions';
import { Intro } from './Intro';
import { getConfigByTransaction } from '../transactions';
import { NotificationCard } from '../notifications';
import { TransactionWallet } from '../wallets/TransactionWallet';
import * as styles from './styles/messageList.styl';
import { Button } from '../ui';

const Messages = ({ messages, assets, onSelect }: IProps) => {
  return messages.map(message => {
    try {
      const config = getConfigByTransaction(message);
      const Card = config.card;
      return (
        <div key={message.id} onClick={() => onSelect(message)}>
          <Card
            className={styles.cardItem}
            message={message}
            assets={assets}
            collapsed={true}
          />
        </div>
      );
    } catch (e) {
      return null;
    }
  });
};

interface IProps {
  messages: any;
  assets: any;
  onSelect: (...args: any) => void;
  onReject: (...args: any) => void;
}

const Notifications = ({ notifications, onShow, onDelete }) => {
  return notifications.map(items => {
    const group = [...items].reverse();
    try {
      return (
        <div key={group[0].origin} className={styles.cardItem}>
          <NotificationCard
            onShow={onShow}
            notifications={group}
            collapsed={true}
            deleteNotifications={onDelete}
          />
        </div>
      );
    } catch (e) {
      return null;
    }
  });
};

class MessageListComponent extends React.Component {
  readonly state = { loading: true };
  readonly props;

  static getDerivedStateFromProps(props) {
    const { messages, assets, notifications } = props;
    const needAssets = MessageListComponent.getAssets(messages, assets);
    needAssets.forEach(id => props.getAsset(id));

    if (needAssets.length > 0) {
      return { loading: true };
    }

    return { messages, assets, notifications, loading: false };
  }

  static getAssets(messages = [], assetsHash) {
    const assets = messages.reduce((acc, message) => {
      const { data } = message;
      const tx = data.data || data;
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

  readonly selectMessageHandler = message => {
    this.props.setActiveMessage(message);
  };

  readonly deleteNotifications = ids => {
    this.props.deleteNotifications(ids);
  };

  readonly deleteAll = () => {
    const ids = this.props.notifications.reduce((acc, item) => {
      return [...acc, ...item.map(({ id }) => id)];
    }, []);
    this.props.deleteNotifications(ids);
  };

  readonly selectNotificationHandler = notification =>
    this.props.setActiveNotification(notification);

  render() {
    if (this.state.loading) {
      return <Intro />;
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
            account={this.props.selectedAccount}
            hideButton={true}
          />
        </div>

        <div className={styles.messageListScrollBox}>
          {hasNotifications && (
            <React.Fragment>
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
            </React.Fragment>
          )}

          {hasMessages && (
            <React.Fragment>
              <div className="basic500">{t('messageList.pendingConfirm')}</div>

              <div className={'basic-500 margin1'}>
                <Messages
                  messages={messages}
                  assets={assets}
                  onSelect={this.selectMessageHandler}
                  onReject={this.props.reject}
                />
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = function (store) {
  return {
    balance: store.balances[store.selectedAccount.address],
    selectedAccount: store.selectedAccount,
    assets: store.assets,
    messages: store.messages,
    notifications: store.notifications,
    hasNewMessages: store.messages.length > 0,
  };
};

const actions = {
  setActiveNotification,
  setActiveMessage,
  deleteNotifications,
  clearMessages,
  getAsset,
  approve,
  reject,
};

export const MessageList = connect(
  mapStateToProps,
  actions
)(withTranslation()(MessageListComponent));
