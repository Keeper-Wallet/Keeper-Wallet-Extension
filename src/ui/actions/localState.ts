import Background from 'ui/services/Background';
import { UiAction, UiActionPayload, UiThunkAction } from 'ui/store';

import { ACTION } from './constants';

function createMVAction<TActionType extends UiAction['type']>(
  type: TActionType
) {
  return (payload: UiActionPayload<TActionType>) => ({
    type,
    payload,
  });
}

export const newAccountName = createMVAction(ACTION.NEW_ACCOUNT_NAME);
export const newAccountSelect = createMVAction(ACTION.NEW_ACCOUNT_SELECT);
export const selectAccount = createMVAction(ACTION.SELECT_ACCOUNT);

const notificationDelete = createMVAction(ACTION.NOTIFICATION_DELETE);

export function deleteAccount(address: string): UiThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentNetwork } = getState();

    await Background.removeWallet(address, currentNetwork);

    dispatch(notificationDelete(true));
    await new Promise(resolve => setTimeout(resolve, 1000));
    dispatch(notificationDelete(false));
  };
}

export const setLangs = createMVAction(ACTION.UPDATE_LANGS);
export const setLoading = createMVAction(ACTION.SET_LOADING);
export const notificationSelect = createMVAction(ACTION.NOTIFICATION_SELECT);

export const notificationChangeName = createMVAction(
  ACTION.NOTIFICATION_NAME_CHANGED
);

export const approvePending = createMVAction(ACTION.APPROVE_PENDING);
export const approveOk = createMVAction(ACTION.APPROVE_OK);
export const approveError = createMVAction(ACTION.APPROVE_ERROR);
export const rejectOk = createMVAction(ACTION.REJECT_OK);
export const clearMessagesStatus = createMVAction(ACTION.APPROVE_REJECT_CLEAR);
export const setIdle = createMVAction(ACTION.REMOTE_CONFIG.SET_IDLE);
export const updateIdle = createMVAction(ACTION.REMOTE_CONFIG.UPDATE_IDLE);
