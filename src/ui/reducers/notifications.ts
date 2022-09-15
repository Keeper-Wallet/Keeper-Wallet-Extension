import { MessageStoreItem } from 'messages/types';
import { NotificationsStoreItem } from 'notifications/types';
import { UiAction } from 'ui/store';
import { ACTION } from '../actions/constants';

export function notifications(
  state: NotificationsStoreItem[][] = [],
  action: UiAction
) {
  switch (action.type) {
    case ACTION.NOTIFICATIONS.SET:
      return action.payload;
    default:
      return state;
  }
}

export const activeNotification = (
  store: NotificationsStoreItem[] | null | undefined = null,
  { type, payload }: UiAction
) => {
  switch (type) {
    case ACTION.NOTIFICATIONS.SET:
      if (!store && payload.length === 1) {
        return payload[0];
      }

      if (store) {
        const { origin } = store[0];
        const newItem = payload.find(([item]) => item.origin === origin);
        if (newItem) {
          return newItem;
        }
      }
      break;
    case ACTION.NOTIFICATIONS.SET_ACTIVE:
      return payload;
  }

  return store;
};

export interface ActivePopupState {
  msg: MessageStoreItem | null;
  notify: NotificationsStoreItem[] | null;
}

export const activePopup = (
  state: ActivePopupState | null = null,
  action: UiAction
): ActivePopupState | null => {
  switch (action.type) {
    case ACTION.MESSAGES.SET_ACTIVE_AUTO:
      return getActiveFromState(
        state,
        action.payload.messages,
        action.payload.allMessages,
        action.payload.notifications
      );
    case ACTION.MESSAGES.UPDATE_ACTIVE:
      return action.payload;
    case ACTION.MESSAGES.SET_ACTIVE_MESSAGE:
      return { notify: null, msg: action.payload };
    case ACTION.MESSAGES.SET_ACTIVE_NOTIFICATION:
      return { msg: null, notify: action.payload };
    default:
      return state;
  }
};

const getActiveFromState = (
  state: ActivePopupState | null,
  messages: MessageStoreItem[] = [],
  allMessages: MessageStoreItem[] = [],
  notifications: NotificationsStoreItem[][] = []
): ActivePopupState | null => {
  // Can activeMessage
  if (state != null && (state.msg || state.notify)) {
    let { msg, notify } = state;

    // Update from messages
    if (msg) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const msgItem = allMessages.find(item => item.id === msg!.id);
      msg = msgItem || allMessages[0] || null;
    }

    // Update from notifications
    if (notify) {
      const { origin } = notify[0];
      const newItem = notifications.find(([item]) => item.origin === origin);
      notify = newItem || notifications[0] || null;
    }

    return { msg, notify };
  }

  // To msgList
  if (messages.length + notifications.length > 1) {
    return null;
  }

  // Has one message
  if (messages.length === 1) {
    return { msg: messages[0], notify: null };
  }

  // Has one notification
  return { notify: notifications[0], msg: null };
};
