import { AccountsThunkAction } from 'accounts/store';
import { SwapScreenInitialState, TabMode } from 'ui/reducers/localState';
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

export const createNew = (
  password: string
): AccountsThunkAction<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(newUser());

    try {
      console.log('before', { initialized: getState().state?.initialized });
      await Background.initVault(password);
      console.log('after', { initialized: getState().state?.initialized });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch(newUserUpdate(err));
    }
  };
};

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

const notificationDelete = createMVAction(ACTION.NOTIFICATION_DELETE);

export function deleteActiveAccount(): UiThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const { selectedAccount, localState, currentNetwork } = getState();

    const selected = localState.assets.account
      ? localState.assets.account.address
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        selectedAccount.address!;

    await Background.removeWallet(selected, currentNetwork);

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
