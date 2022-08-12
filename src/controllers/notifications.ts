import ObservableStore from 'obs-store';
import { extension } from 'lib/extension';
import { MsgStatus, MSG_STATUSES } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import log from 'loglevel';
import EventEmitter from 'events';
import { ERRORS } from '../lib/keeperError';
import { ExtensionStore } from '../storage/storage';
import { RemoteConfigController } from './remoteConfig';
import { PermissionsController } from './permissions';
import { NotificationsStoreItem } from 'notifications/types';
import { PreferencesAccount } from 'preferences/types';

export class NotificationsController extends EventEmitter {
  private notifications;
  private store;
  private getMessagesConfig;
  private canShowNotification;
  private setNotificationPermissions;

  constructor({
    localStore,
    getMessagesConfig,
    canShowNotification,
    setNotificationPermissions,
  }: {
    localStore: ExtensionStore;
    getMessagesConfig: RemoteConfigController['getMessagesConfig'];
    canShowNotification: PermissionsController['canUseNotification'];
    setNotificationPermissions: PermissionsController['setNotificationPermissions'];
  }) {
    super();

    this.notifications = localStore.getInitState({
      notifications: [],
    });

    this.store = new ObservableStore(this.notifications);
    localStore.subscribe(this.store);

    this.getMessagesConfig = getMessagesConfig;
    this.canShowNotification = canShowNotification;
    this.setNotificationPermissions = setNotificationPermissions;

    this.deleteAllByTime();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extension.alarms.onAlarm.addListener(({ name }: any) => {
      if (name === 'deleteMessages') {
        this.deleteAllByTime();
      }
    });
  }

  validateNotification(
    data: { message?: string; origin?: string; title?: string } | null
  ): asserts data is { message: string; origin: string; title: string } {
    const config = this.getMessagesConfig();
    const {
      notification_title_max,
      notification_message_max,
      notification_interval_min,
    } = config;

    if (!data || !data.origin) {
      throw ERRORS.NOTIFICATION_DATA_ERROR();
    }

    const { title, message } = data;

    if (!title) {
      throw ERRORS.NOTIFICATION_DATA_ERROR(undefined, `title is required`);
    }

    if (title && title.length > notification_title_max) {
      throw ERRORS.NOTIFICATION_DATA_ERROR(
        undefined,
        `title has more than ${notification_title_max} characters`
      );
    }

    if (message && message.length > notification_message_max) {
      throw ERRORS.NOTIFICATION_DATA_ERROR(
        undefined,
        `message has more than ${notification_message_max} characters`
      );
    }

    this.canShowNotification(data.origin, notification_interval_min);
  }

  newNotification(data: {
    address: string;
    message?: string;
    origin: string;
    status: MsgStatus;
    timestamp: number;
    title?: string;
    type: 'simple';
  }) {
    log.debug(`New notification ${data.type}: ${JSON.stringify(data)}`);

    this.validateNotification(data);

    const notification = this._generateMessage(data);

    const notifications = this.store.getState().notifications;

    this._deleteNotificationsByLimit(
      notifications,
      this.getMessagesConfig().max_messages
    );

    log.debug(`Generated notification ${JSON.stringify(notification)}`);

    notifications.push(notification);
    this._updateStore(notifications);
    this.setNotificationPermissions(data.origin, true, Date.now());
    return { id: notification.id };
  }

  deleteNotifications(ids: string[]) {
    this._deleteMessages(ids);
  }

  getNotificationsByAccount(account: PreferencesAccount | undefined) {
    if (!account || !account.address) {
      return [];
    }
    return this.notifications.notifications.filter(
      notification => notification.address === account.address
    );
  }

  getGroupNotificationsByAccount(account: PreferencesAccount | undefined) {
    const notifications = this.getNotificationsByAccount(account);
    return [...notifications].reverse().reduce<{
      items: NotificationsStoreItem[][];
      hash: Record<string, NotificationsStoreItem[]>;
    }>(
      (acc, item) => {
        if (!acc.hash[item.origin]) {
          acc.hash[item.origin] = [];
          acc.items.push(acc.hash[item.origin]);
        }

        acc.hash[item.origin].push(item);

        return acc;
      },
      { items: [], hash: {} }
    ).items;
  }

  deleteAllByTime() {
    const { message_expiration_ms } = this.getMessagesConfig();
    const time = Date.now();
    const { notifications } = this.store.getState();
    const toDelete: string[] = [];
    notifications.forEach(({ id, timestamp }) => {
      if (time - timestamp > message_expiration_ms) {
        toDelete.push(id);
      }
    });

    this._deleteMessages(toDelete);
    this._updateMessagesByTimeout();
  }

  setMessageStatus(id: string, status: NotificationsStoreItem['status']) {
    const { notifications } = this.store.getState();
    const index = notifications.findIndex(msg => msg.id === id);
    if (index > -1) {
      notifications.splice(index, 1, { ...notifications[index], status });
      this._updateStore(notifications);
    }
  }

  deleteMsg(id: string) {
    this._deleteMessages([id]);
  }

  _generateMessage({
    address,
    origin,
    title,
    type,
    timestamp,
    message,
  }: {
    address: NotificationsStoreItem['address'];
    origin: NotificationsStoreItem['origin'];
    title: NotificationsStoreItem['title'];
    type: NotificationsStoreItem['type'];
    timestamp: NotificationsStoreItem['timestamp'];
    message: NotificationsStoreItem['message'];
  }): NotificationsStoreItem {
    return {
      type,
      title,
      origin,
      address,
      message,
      id: uuidv4(),
      timestamp: timestamp || Date.now(),
      status: MSG_STATUSES.NEW_NOTIFICATION,
    };
  }

  _deleteMessages(ids: string[]) {
    const { notifications } = this.store.getState();
    const newNotifications = notifications.filter(
      ({ id }) => !ids.includes(id)
    );
    if (newNotifications.length !== notifications.length) {
      this._updateStore(newNotifications);
    }
  }

  _deleteNotificationsByLimit(
    notifications: NotificationsStoreItem[],
    limit: number
  ) {
    const toDelete: string[] = [];

    while (notifications.length > limit) {
      const oldest = notifications.sort((a, b) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        toDelete.push(oldest.id);
      } else {
        break;
      }
    }

    this._deleteMessages(toDelete);
  }

  _updateStore(notifications: NotificationsStoreItem[]) {
    const data = { ...this.store.getState(), notifications };
    this.store.updateState(data);
    this.notifications = data;
    this.emit('Update badge');
  }

  _updateMessagesByTimeout() {
    const { update_messages_ms } = this.getMessagesConfig();
    extension.alarms.create('deleteMessages', {
      delayInMinutes: update_messages_ms / 1000 / 60,
    });
  }
}
