import { type PopupThunkAction } from 'popup/store/types';
import Background from 'ui/services/Background';

import { type Message } from '../../messages/types';
import { type NotificationsStoreItem } from '../../notifications/types';
import { ACTION } from './constants';

export function deleteNotifications(
  ids: string[],
  next?: NotificationsStoreItem[],
): PopupThunkAction<Promise<void>> {
  return async dispatch => {
    await Background.deleteNotifications(ids);
    dispatch(setActiveNotification(next));
  };
}

export function setShowNotification(options: {
  origin: string;
  canUse: boolean | null;
}) {
  return {
    type: ACTION.NOTIFICATIONS.SET_PERMS,
    payload: options,
  };
}

export function setActiveNotification(
  notify: NotificationsStoreItem[] | undefined,
) {
  return {
    type: ACTION.MESSAGES.SET_ACTIVE_NOTIFICATION,
    payload: notify,
  };
}

export function setActiveMessage(msg: Message | undefined) {
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
