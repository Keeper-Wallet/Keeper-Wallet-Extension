import { type Message } from '../../messages/types';
import { type NotificationsStoreItem } from '../../notifications/types';
import { type AppAction } from '../../store/types';
import { ACTION } from '../actions/constants';

export function notifications(
  state: NotificationsStoreItem[][] = [],
  action: AppAction,
) {
  switch (action.type) {
    case ACTION.NOTIFICATIONS.SET:
      return action.payload;
    default:
      return state;
  }
}

interface ActivePopupState {
  msg?: Message;
  notify?: NotificationsStoreItem[];
}

export function activePopup(
  state: ActivePopupState | null = null,
  action: AppAction,
): ActivePopupState | null {
  switch (action.type) {
    case ACTION.MESSAGES.SET_ACTIVE_AUTO:
      if (state != null) {
        const { msg, notify } = state;

        if (msg) {
          return {
            msg:
              action.payload.allMessages?.find(item => item.id === msg.id) ??
              action.payload.allMessages?.[0],
          };
        }

        if (notify) {
          return {
            notify:
              action.payload.notifications.find(
                ([item]) => item.origin === notify[0].origin,
              ) ?? action.payload.notifications[0],
          };
        }
      }

      return action.payload.messages.length +
        action.payload.notifications.length >
        1
        ? null
        : action.payload.messages.length === 1
        ? { msg: action.payload.messages[0] }
        : { notify: action.payload.notifications[0] };
    case ACTION.MESSAGES.UPDATE_ACTIVE:
      return action.payload;
    case ACTION.MESSAGES.SET_ACTIVE_MESSAGE:
      return { msg: action.payload };
    case ACTION.MESSAGES.SET_ACTIVE_NOTIFICATION:
      return { notify: action.payload };
    default:
      return state;
  }
}
