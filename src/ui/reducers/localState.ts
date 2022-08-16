import { combineReducers } from 'redux';
import { ACTION } from '../actions';
import { UiAction } from 'ui/store';
import { PreferencesAccount } from 'preferences/types';

function newUser(state = {}, action: UiAction) {
  switch (action.type) {
    case ACTION.SET_PASSWORD_PENDING:
    case ACTION.SET_PASSWORD_UPDATE:
      return { ...state, ...action.payload.unapprovedMessages };
  }

  return state;
}

function assets(
  state: { account?: PreferencesAccount } = {},
  action: UiAction
) {
  switch (action.type) {
    case ACTION.SET_ACTIVE_ACCOUNT:
      return { ...state, account: action.payload };
  }

  return state;
}

function login(state: { error?: unknown } = {}, action: UiAction) {
  switch (action.type) {
    case ACTION.LOGIN_UPDATE:
    case ACTION.LOGIN_PENDING:
      return { ...state, ...action.payload };
  }

  return state;
}

export type NewAccountState = {
  address: string | null;
  hasBackup?: boolean;
  name: string;
} & (
  | {
      type: 'seed';
      seed: string;
    }
  | {
      type: 'encodedSeed';
      encodedSeed: string;
    }
  | {
      type: 'privateKey';
      privateKey: string;
    }
  | {
      type: 'ledger';
      id: number;
      publicKey: string;
    }
  | {
      type: 'wx';
      publicKey: string;
      uuid: string;
      username: string;
    }
);

function newAccount(
  state: NewAccountState = {
    name: '',
    address: '',
    type: 'seed',
    seed: '',
  },
  action: UiAction
): NewAccountState {
  switch (action.type) {
    case ACTION.NEW_ACCOUNT_NAME: {
      const name = action.payload != null ? action.payload : state.name;
      return { ...state, name };
    }
    case ACTION.NEW_ACCOUNT_SELECT:
      return { ...state, ...action.payload };
  }

  return state;
}

function menu(state = { logo: false }, { type, payload }: UiAction) {
  if (type === ACTION.CHANGE_MENU) {
    return { ...state, ...payload };
  }
  return state;
}

function loading(state = true, { type, payload }: UiAction) {
  if (type === ACTION.LOADING) {
    return payload;
  }

  return state;
}

export interface NotificationsState {
  accountCreationSuccess?: boolean;
  accountImportSuccess?: boolean;
  changeName?: boolean;
  deleted?: boolean;
  selected?: boolean;
}

function notifications(
  state: NotificationsState = {},
  { type, payload }: UiAction
): NotificationsState {
  switch (type) {
    case ACTION.NOTIFICATION_SELECT:
      return { ...state, selected: payload };
    case ACTION.NOTIFICATION_DELETE:
      return { ...state, deleted: payload };
    case ACTION.NOTIFICATION_NAME_CHANGED:
      return { ...state, changeName: payload };
    default:
      return state;
  }
}

export interface TransactionStatusState {
  approvePending?: boolean;
  approveOk?: string | boolean;
  approveError?: boolean | { error: unknown; message: unknown };
  rejectOk?: string | boolean;
}

function transactionStatus(
  state: TransactionStatusState = {},
  { type, payload }: UiAction
): TransactionStatusState {
  switch (type) {
    case ACTION.APPROVE_PENDING:
      return { ...state, approvePending: payload };
    case ACTION.APPROVE_OK:
      return { ...state, approveOk: payload };
    case ACTION.APPROVE_ERROR:
      return { ...state, approveError: payload };
    case ACTION.REJECT_OK:
      return { ...state, rejectOk: payload };
    case ACTION.APPROVE_REJECT_CLEAR:
      return {};
  }

  return state;
}

export interface SwapScreenInitialState {
  fromAssetId: string | null;
}

const swapScreenInitialStateDefault = { fromAssetId: null };

function swapScreenInitialState(
  state: SwapScreenInitialState = swapScreenInitialStateDefault,
  action: UiAction
): SwapScreenInitialState {
  switch (action.type) {
    case ACTION.SET_SWAP_SCREEN_INITIAL_STATE:
      return action.payload;
    case ACTION.RESET_SWAP_SCREEN_INITIAL_STATE:
      return swapScreenInitialStateDefault;
    default:
      return state;
  }
}

export type TabMode = 'popup' | 'tab';

function tabMode(state: TabMode = 'popup', action: UiAction): TabMode {
  if (action.type === ACTION.SET_TAB_MODE) {
    return action.payload;
  }
  return state;
}

export const localState = combineReducers({
  tabMode,
  loading,
  newUser,
  login,
  newAccount,
  menu,
  assets,
  notifications,
  transactionStatus,
  swapScreenInitialState,
});
