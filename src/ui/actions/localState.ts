import { ACTION } from './constants';

const createCommonAction = (type, pending) => (error = false) => ({
    type,
    payload: {
        pending,
        error
    }
});
const createMVAction = type => payload => ({
    type,
    payload
});

export const createNew = createMVAction(ACTION.SET_PASSWORD);
export const newUser = createCommonAction(ACTION.SET_PASSWORD_PENDING, true);
export const newUserUpdate = createCommonAction(ACTION.SET_PASSWORD_UPDATE, false);

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
export const notificationDelete = createMVAction(ACTION.NOTIFICATION_DELETE);
export const notificationSelect = createMVAction(ACTION.NOTIFICATION_SELECT);
export const notificationChangeName = createMVAction(ACTION.NOTIFICATION_NAME_CHANGED);
