import EventEmitter from 'events';
import { nanoid } from 'nanoid';
import { type NotificationsStoreItem } from 'notifications/types';
import ObservableStore from 'obs-store';
import { type PreferencesAccount } from 'preferences/types';
import Browser from 'webextension-polyfill';

import { ERRORS } from '../lib/keeperError';
import { type ExtensionStorage } from '../storage/storage';
import { type PermissionsController } from './permissions';
import { type RemoteConfigController } from './remoteConfig';

export class NotificationsController extends EventEmitter {
  #canShowNotification;
  #getMessagesConfig;
  #setNotificationPermissions;
  #store;

  constructor({
    extensionStorage,
    getMessagesConfig,
    canShowNotification,
    setNotificationPermissions,
  }: {
    extensionStorage: ExtensionStorage;
    getMessagesConfig: RemoteConfigController['getMessagesConfig'];
    canShowNotification: PermissionsController['canUseNotification'];
    setNotificationPermissions: PermissionsController['setNotificationPermissions'];
  }) {
    super();

    this.#store = new ObservableStore(
      extensionStorage.getInitState({
        notifications: [],
      }),
    );

    extensionStorage.subscribe(this.#store);

    this.#getMessagesConfig = getMessagesConfig;
    this.#canShowNotification = canShowNotification;
    this.#setNotificationPermissions = setNotificationPermissions;

    this.#deleteAllByTime();

    Browser.alarms.onAlarm.addListener(({ name }) => {
      if (name === 'deleteMessages') {
        this.#deleteAllByTime();
      }
    });
  }

  #deleteAllByTime() {
    const { message_expiration_ms, update_messages_ms } =
      this.#getMessagesConfig();

    const { notifications } = this.#store.getState();

    this.deleteNotifications(
      notifications
        .filter(
          notification =>
            Date.now() - notification.timestamp > message_expiration_ms,
        )
        .map(notification => notification.id),
    );

    Browser.alarms.create('deleteMessages', {
      delayInMinutes: update_messages_ms / 1000 / 60,
    });
  }

  #updateNotifications(notifications: NotificationsStoreItem[]) {
    this.#store.updateState({ ...this.#store.getState(), notifications });
    this.emit('Update badge');
  }

  newNotification(data: {
    address: string;
    message: string | undefined;
    origin: string;
    timestamp: number;
    title: string | undefined;
    type: 'simple';
  }) {
    const {
      notification_title_max,
      notification_message_max,
      notification_interval_min,
    } = this.#getMessagesConfig();

    if (!data || !data.origin) {
      throw ERRORS.NOTIFICATION_DATA_ERROR();
    }

    const { message, title } = data;

    if (!title) {
      throw ERRORS.NOTIFICATION_DATA_ERROR(undefined, `title is required`);
    }

    if (title && title.length > notification_title_max) {
      throw ERRORS.NOTIFICATION_DATA_ERROR(
        undefined,
        `title has more than ${notification_title_max} characters`,
      );
    }

    if (message && message.length > notification_message_max) {
      throw ERRORS.NOTIFICATION_DATA_ERROR(
        undefined,
        `message has more than ${notification_message_max} characters`,
      );
    }

    this.#canShowNotification(data.origin, notification_interval_min);

    const { notifications } = this.#store.getState();
    const id = nanoid();

    this.#updateNotifications(
      notifications.concat({
        address: data.address,
        id,
        message,
        origin: data.origin,
        timestamp: data.timestamp || Date.now(),
        title,
        type: data.type,
      }),
    );

    this.#setNotificationPermissions(data.origin, true, Date.now());

    return id;
  }

  deleteNotifications(ids: string[]) {
    const { notifications } = this.#store.getState();

    this.#updateNotifications(
      notifications.filter(({ id }) => !ids.includes(id)),
    );
  }

  getNotifications(account: PreferencesAccount) {
    return this.#store
      .getState()
      .notifications.filter(
        notification => notification.address === account.address,
      );
  }
}
