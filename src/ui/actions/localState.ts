import { SwapScreenInitialState, TabMode } from 'ui/reducers/localState';
import { UiAction, UiActionPayload } from 'ui/store';
import { ACTION } from './constants';

function createMVAction<TActionType extends UiAction['type']>(
  type: TActionType
) {
  return (payload: UiActionPayload<TActionType>) => ({
    type,
    payload,
  });
}

const createCommonAction =
  <
    TActionType extends
      | typeof ACTION.SET_PASSWORD_PENDING
      | typeof ACTION.SET_PASSWORD_UPDATE
      | typeof ACTION.LOGIN_PENDING
      | typeof ACTION.LOGIN_UPDATE
  >(
    type: TActionType,
    pending: boolean
  ) =>
  (error = false) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createMVAction(type)({ pending, error } as any);

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

export const setLangs = createMVAction(ACTION.UPDATE_LANGS);
export const setLoading = createMVAction(ACTION.SET_LOADING);
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

export function setTabMode(mode: TabMode) {
  return { type: ACTION.SET_TAB_MODE, payload: mode };
}
