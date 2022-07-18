import { Message } from 'ui/components/transactions/BaseTransaction';
import { ACTION } from '../actions';

const createSimpleReducer =
  (def, type) =>
  (store = def, action) =>
    type === action.type ? action.payload : store;

export const notifications = createSimpleReducer([], ACTION.NOTIFICATIONS.SET);

export const activeNotification = (store = null, { type, payload }) => {
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

interface ActivePopupState {
  msg: Message;
  notify: unknown;
}

export const activePopup = (
  state: ActivePopupState | null = null,
  action:
    | {
        type: typeof ACTION.MESSAGES.SET_ACTIVE_AUTO;
        payload: {
          allMessages: Message[];
          messages: Message[];
          notifications: unknown[];
        };
      }
    | {
        type: typeof ACTION.MESSAGES.UPDATE_ACTIVE;
        payload: null;
      }
    | {
        type: typeof ACTION.MESSAGES.SET_ACTIVE_MESSAGE;
        payload: Message;
      }
    | {
        type: typeof ACTION.MESSAGES.SET_ACTIVE_NOTIFICATION;
        payload: unknown;
      }
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
  messages: Message[] = [],
  allMessages: Message[] = [],
  notifications: unknown[] = []
): ActivePopupState | null => {
  // Can activeMessage
  if (state != null && (state.msg || state.notify)) {
    // Update from messages
    if (state.msg) {
      const msgItem = allMessages.find(item => item.id === state.msg.id);
      state.msg = msgItem || state.msg;
    }

    // Update from notifications
    if (state.notify) {
      const { origin } = state.notify[0];
      const newItem = notifications.find(([item]) => item.origin === origin);
      state.notify = newItem || state.notify;
    }

    return state;
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
