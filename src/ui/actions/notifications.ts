import { ACTION } from './constants';

export function setNotifications(notifications) {
  return {
    type: ACTION.NOTIFICATIONS.SET,
    payload: notifications,
  };
}

export function deleteNotifications(ids: [string]) {
  return {
    type: ACTION.NOTIFICATIONS.DELETE,
    payload: ids,
  };
}

export function setShowNotification(options) {
  return {
    type: ACTION.NOTIFICATIONS.SET_PERMS,
    payload: options,
  };
}

export function setActiveNotification(notify: Array<unknown> | null) {
  return {
    type: ACTION.MESSAGES.SET_ACTIVE_NOTIFICATION,
    payload: notify,
  };
}

export function setActiveMessage(msg: unknown | null) {
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
