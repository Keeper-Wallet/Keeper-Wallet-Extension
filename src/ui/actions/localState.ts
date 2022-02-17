import { SwapScreenInitialState } from 'ui/reducers/localState';
import { ACTION } from './constants';

function createMVAction<TPayload>(type: string) {
  return (payload: TPayload | null = null) => ({ type, payload });
}

const createCommonAction =
  (type, pending) =>
  (error = false) =>
    createMVAction(type)({ pending, error });

export const createNew = createMVAction(ACTION.SET_PASSWORD);
export const newUser = createCommonAction(ACTION.SET_PASSWORD_PENDING, true);
export const newUserUpdate = createCommonAction(
  ACTION.SET_PASSWORD_UPDATE,
  false
);

export const login = createMVAction(ACTION.LOGIN);
export const loginPending = createCommonAction(ACTION.LOGIN_PENDING, true);
export const loginUpdate = createCommonAction(ACTION.LOGIN_UPDATE, false);

export const newAccountName = createMVAction(ACTION.NEW_ACCOUNT_NAME);
export const newAccountSelect = createMVAction(ACTION.NEW_ACCOUNT_SELECT);
export const selectAccount = createMVAction(ACTION.SELECT_ACCOUNT);
export const deleteActiveAccount = createMVAction(ACTION.DELETE_ACTIVE_ACCOUNT);
export const addBackTab = createMVAction(ACTION.ADD_BACK_TAB);
export const removeBackTab = createMVAction(ACTION.REMOVE_BACK_TAB);
export const setLangs = createMVAction(ACTION.UPDATE_LANGS);
export const loading = createMVAction(ACTION.LOADING);
export const notificationAccountCreationSuccess = createMVAction<boolean>(
  ACTION.NOTIFICATION_ACCOUNT_CREATION_SUCCESS
);
export const notificationAccountImportSuccess = createMVAction<boolean>(
  ACTION.NOTIFICATION_ACCOUNT_IMPORT_SUCCESS
);
export const notificationDelete = createMVAction<boolean>(
  ACTION.NOTIFICATION_DELETE
);
export const notificationSelect = createMVAction<boolean>(
  ACTION.NOTIFICATION_SELECT
);
export const notificationChangeName = createMVAction<boolean>(
  ACTION.NOTIFICATION_NAME_CHANGED
);

export const approvePending = createMVAction(ACTION.APPROVE_PENDING);
export const approveOk = createMVAction(ACTION.APPROVE_OK);
export const approveError = createMVAction(ACTION.APPROVE_ERROR);
export const rejectOk = createMVAction(ACTION.REJECT_OK);
export const clearMessagesStatus = createMVAction(ACTION.APPROVE_REJECT_CLEAR);
export const closeNotificationWindow = createMVAction(ACTION.CLOSE_WINDOW);
export const setIdle = createMVAction(ACTION.REMOTE_CONFIG.SET_IDLE);
export const updateIdle = createMVAction(ACTION.REMOTE_CONFIG.UPDATE_IDLE);

export function setSwapScreenInitialState(
  initialState: SwapScreenInitialState
) {
  return {
    type: ACTION.SET_SWAP_SCREEN_INITIAL_STATE,
    payload: initialState,
  };
}

export function resetSwapScreenInitialState() {
  return { type: ACTION.RESET_SWAP_SCREEN_INITIAL_STATE };
}
