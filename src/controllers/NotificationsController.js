import ObservableStore from 'obs-store';
import { extension } from 'lib/extension';
import { MSG_STATUSES } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import log from 'loglevel';
import EventEmitter from 'events';
import { ERRORS } from '../lib/KeeperError';

export class NotificationsController extends EventEmitter {
  constructor({
    localStore,
    getMessagesConfig,
    canShowNotification,
    setNotificationPermissions,
  }) {
    super();

    const defaults = {
      notifications: [],
    };
    this.notifications = localStore.getInitState(defaults);
    this.store = new ObservableStore(this.notifications);
    localStore.subscribe(this.store);

    this.getMessagesConfig = getMessagesConfig;
    this.canShowNotification = canShowNotification;
    this.setNotificationPermissions = setNotificationPermissions;

    this.deleteAllByTime();
    extension.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'deleteMessages') {
        this.deleteAllByTime();
      }
    });
  }

  /**
   *
   * @param data
   * @param {string} data.message
   * @param {string} data.title
   * @param {string} data.origin
   * @param {string} data.type
   * @param {string} data.timestamp
   * @param {string} data.address
   * @param {string} data.status
   */
  validateNotification(data) {
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

  /**
   * @title New notification
   * @param data
   * @param {string} data.message
   * @param {string} data.title
   * @param {string} data.origin
   * @param {string} data.type
   * @param {string} data.timestamp
   * @param {string} data.address
   * @param {string} data.status
   * @return {Promise<{ id }>}
   */
  newNotification(data) {
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

  /**
   * @param {Array<string>} ids
   */
  deleteNotifications(ids) {
    this._deleteMessages(ids);
  }

  /**
   * @param {object} account
   * @return {T[]}
   */
  getNotificationsByAccount(account) {
    if (!account || !account.address) {
      return [];
    }
    return this.notifications.notifications.filter(
      notification => notification.address === account.address
    );
  }

  /**
   * @param account
   * @return {Array}
   */
  getGroupNotificationsByAccount(account) {
    const notifications = this.getNotificationsByAccount(account);
    return [...notifications].reverse().reduce(
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

  /**
   * @return {void}
   */
  deleteAllByTime() {
    const { message_expiration_ms } = this.getMessagesConfig();
    const time = Date.now();
    const { notifications } = this.store.getState();
    const toDelete = [];
    notifications.forEach(({ id, timestamp }) => {
      if (time - timestamp > message_expiration_ms) {
        toDelete.push(id);
      }
    });

    this._deleteMessages(toDelete);
    this._updateMessagesByTimeout();
  }

  /**
   * @param {string} id
   * @param {"showed_notify" | "new_notify"} status
   */
  setMessageStatus(id, status) {
    const { notifications } = this.store.getState();
    const index = notifications.findIndex(msg => msg.id === id);
    if (index > -1) {
      notifications.splice(index, 1, { ...notifications[index], status });
      this._updateStore(notifications);
    }
  }

  /**
   * @param {string} id
   */
  deleteMsg(id) {
    this._deleteMessages([id]);
  }

  /**
   * @param data
   * @param {string} data.message
   * @param {string} data.title
   * @param {string} data.origin
   * @param {string} data.type
   * @param {string} data.timestamp
   * @param {string} data.address
   * @return {any}
   * @private
   */
  _generateMessage({ address, origin, title, type, timestamp, message }) {
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

  /**
   * @param {string} {[]} ids
   * @private
   */
  _deleteMessages(ids) {
    const { notifications } = this.store.getState();
    const newNotifications = notifications.filter(
      ({ id }) => !ids.includes(id)
    );
    if (newNotifications.length !== notifications.length) {
      this._updateStore(newNotifications);
    }
  }

  _deleteNotificationsByLimit(notifications, limit) {
    const toDelete = [];

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

  /**
   * @param {[]} notifications
   * @private
   */
  _updateStore(notifications) {
    const data = { ...this.store.getState(), notifications };
    this.store.updateState(data);
    this.notifications = data;
    this.emit('Update badge');
  }

  /**
   * @return {void}
   * @private
   */
  _updateMessagesByTimeout() {
    const { update_messages_ms } = this.getMessagesConfig();
    extension.alarms.create('deleteMessages', {
      delayInMinutes: update_messages_ms / 1000 / 60,
    });
  }
}
