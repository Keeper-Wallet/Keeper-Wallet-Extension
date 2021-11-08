import { ACTION } from './constants';

const createMVAction =
  type =>
  (payload = null) => ({ type, payload });
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
export const clearSeedErrors = createMVAction(ACTION.NEW_ACCOUNT_CLEAR_ERRORS);
export const selectAccount = createMVAction(ACTION.SELECT_ACCOUNT);
export const deleteActiveAccount = createMVAction(ACTION.DELETE_ACTIVE_ACCOUNT);
export const addBackTab = createMVAction(ACTION.ADD_BACK_TAB);
export const removeBackTab = createMVAction(ACTION.REMOVE_BACK_TAB);
export const setLangs = createMVAction(ACTION.UPDATE_LANGS);
export const loading = createMVAction(ACTION.LOADING);
export const notificationDelete = createMVAction(ACTION.NOTIFICATION_DELETE);
export const notificationSelect = createMVAction(ACTION.NOTIFICATION_SELECT);
export const notificationChangeName = createMVAction(
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
