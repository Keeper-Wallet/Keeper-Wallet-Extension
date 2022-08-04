import { MessageStoreItem } from 'messages/types';
import { NotificationsStoreItem } from 'notifications/types';
import { ACTION } from './constants';

export function setNotifications(notifications: NotificationsStoreItem[][]) {
  return {
    type: ACTION.NOTIFICATIONS.SET,
    payload: notifications,
  };
}

export function deleteNotifications(
  ids:
    | string[]
    | {
        ids: string[];
        next: NotificationsStoreItem[] | null;
      }
) {
  return {
    type: ACTION.NOTIFICATIONS.DELETE,
    payload: ids,
  };
}

export function setShowNotification(options: {
  origin: string | undefined;
  canUse: boolean | null;
}) {
  return {
    type: ACTION.NOTIFICATIONS.SET_PERMS,
    payload: options,
  };
}

export function setActiveNotification(notify: NotificationsStoreItem[] | null) {
  return {
    type: ACTION.MESSAGES.SET_ACTIVE_NOTIFICATION,
    payload: notify,
  };
}

export function setActiveMessage(msg: MessageStoreItem | null) {
  return {
    type: ACTION.MESSAGES.SET_ACTIVE_MESSAGE,
    payload: msg,
  };
}

export function updateActiveState() {
  return {
    type: ACTION.MESSAGES.UPDATE_ACTIVE,
    payload: null,
  };
}
