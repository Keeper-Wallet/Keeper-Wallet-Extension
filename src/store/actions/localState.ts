import { type PopupThunkAction } from '../../popup/store/types';
import Background from '../../ui/services/Background';
import { type AppAction, type AppActionPayload } from '../types';
import { ACTION } from './constants';
import { setActiveMessage, setActiveNotification } from './notifications';

function createMVAction<TActionType extends AppAction['type']>(
  type: TActionType,
) {
  return (payload: AppActionPayload<TActionType>) => ({
    type,
    payload,
  });
}

export const newAccountName = createMVAction(ACTION.NEW_ACCOUNT_NAME);
export const newAccountSelect = createMVAction(ACTION.NEW_ACCOUNT_SELECT);
export const selectAccount = createMVAction(ACTION.SELECT_ACCOUNT);

const notificationDelete = createMVAction(ACTION.NOTIFICATION_DELETE);

export function deleteAccount(
  address: string,
): PopupThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentNetwork } = getState();

    await Background.removeWallet(address, currentNetwork);

    dispatch(notificationDelete(true));
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch(notificationDelete(false));
  };
}

export const setLoading = createMVAction(ACTION.SET_LOADING);
export const notificationSelect = createMVAction(ACTION.NOTIFICATION_SELECT);

export const notificationChangeName = createMVAction(
  ACTION.NOTIFICATION_NAME_CHANGED,
);

export function clearMessagesStatus(): PopupThunkAction<void> {
  return (dispatch, getState) => {
    const { activePopup, messages, notifications } = getState();

    const message = messages.find(x => x.id !== activePopup?.msg?.id);

    if (message) {
      dispatch(setActiveMessage(message));
    } else {
      dispatch(setActiveNotification(notifications[0]));
    }
  };
}

export const setIdle = createMVAction(ACTION.REMOTE_CONFIG.SET_IDLE);
export const updateIdle = createMVAction(ACTION.REMOTE_CONFIG.UPDATE_IDLE);
