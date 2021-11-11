import { ACTION } from '../actions/constants';

export * from './localState';
export * from './remoteConfig';
export * from './notifications';

const MAX_HISTORY = 10;

function createSimpleReducer<
  TState = unknown,
  TActionType extends string = string
>(initialState: TState, actionType: TActionType) {
  return (
    state = initialState,
    action: { type: TActionType; payload: TState }
  ) => (actionType === action.type ? action.payload : state);
}

export const tab = createSimpleReducer('', ACTION.CHANGE_TAB);
export const uiState = createSimpleReducer({}, ACTION.UPDATE_UI_STATE);
export const accounts = createSimpleReducer([], ACTION.UPDATE_ACCOUNTS);
export const allNetworksAccounts = createSimpleReducer(
  [],
  ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS
);
export const state = createSimpleReducer(null, ACTION.UPDATE_APP_STATE);
export const selectedAccount = createSimpleReducer<{ address?: string }>(
  {},
  ACTION.UPDATE_SELECTED_ACCOUNT
);
export const networks = createSimpleReducer([], ACTION.UPDATE_NETWORKS);
export const currentNetwork = createSimpleReducer(
  '',
  ACTION.UPDATE_CURRENT_NETWORK
);
export const balances = createSimpleReducer({}, ACTION.UPDATE_BALANCES);
export const currentLocale = createSimpleReducer('en', ACTION.UPDATE_FROM_LNG);
export const customNodes = createSimpleReducer({}, ACTION.UPDATE_NODES);
export const customCodes = createSimpleReducer({}, ACTION.UPDATE_CODES);
export const customMatcher = createSimpleReducer({}, ACTION.UPDATE_MATCHER);
export const langs = createSimpleReducer({}, ACTION.UPDATE_LANGS);
export const origins = createSimpleReducer({}, ACTION.UPDATE_ORIGINS);
export const idleOptions = createSimpleReducer(
  {},
  ACTION.REMOTE_CONFIG.UPDATE_IDLE
);

export const messages = (state = [], action: any) => {
  if (ACTION.UPDATE_MESSAGES === action.type) {
    return [...action.payload.unapprovedMessages];
  }

  return state;
};

export const assets = (state = {}, action: any) => {
  if (ACTION.UPDATE_ASSET === action.type) {
    return { ...state, ...action.payload };
  }
  return state;
};

export const backTabs = (state = [], { type, payload }) => {
  if (type === ACTION.ADD_BACK_TAB) {
    state = [...state, payload].slice(-MAX_HISTORY);
  } else if (type === ACTION.REMOVE_BACK_TAB) {
    state = state.slice(0, -1);
  }
  return state;
};

export const version = (state = '') => state;
