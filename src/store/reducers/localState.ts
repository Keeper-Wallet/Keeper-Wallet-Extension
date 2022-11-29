import { combineReducers } from 'redux';

import { ACTION } from '../actions/constants';
import { AppAction } from '../types';

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
  action: AppAction
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

function loading(state = true, { type, payload }: AppAction) {
  return type === ACTION.SET_LOADING ? payload : state;
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
  { type, payload }: AppAction
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
  { type, payload }: AppAction
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

export const localState = combineReducers({
  loading,
  newAccount,
  notifications,
  transactionStatus,
});
