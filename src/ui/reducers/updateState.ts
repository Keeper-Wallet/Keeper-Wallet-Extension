import { ACTION } from '../actions';
import { AssetDetail } from '../services/Background';
import {
  ITransaction,
  WithId,
} from '@waves/waves-transactions/dist/transactions';

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
export const uiState = createSimpleReducer<{ isFeatureUpdateShown?: boolean }>(
  {},
  ACTION.UPDATE_UI_STATE
);
export const accounts = createSimpleReducer<
  Array<{
    address: string;
    name: string;
    network: string;
    type: string;
  }>
>([], ACTION.UPDATE_ACCOUNTS);
export const allNetworksAccounts = createSimpleReducer<
  Array<{
    address: string;
    name: string;
    network: string;
    networkCode: string;
    publicKey: string;
    type: string;
  }>
>([], ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS);
export const state = createSimpleReducer(null, ACTION.UPDATE_APP_STATE);

interface SelectedAccountState {
  address?: string;
  networkCode?: string;
}

export function selectedAccount(
  state: SelectedAccountState = {},
  action: { type: string; payload: SelectedAccountState }
) {
  switch (action.type) {
    case ACTION.SELECT_ACCOUNT:
    case ACTION.UPDATE_SELECTED_ACCOUNT:
      return action.payload;
    default:
      return state;
  }
}

export const networks = createSimpleReducer([], ACTION.UPDATE_NETWORKS);
export const currentNetwork = createSimpleReducer(
  '',
  ACTION.UPDATE_CURRENT_NETWORK
);
export const balances = createSimpleReducer<
  Record<
    string,
    {
      available: string;
      leasedOut: string;
      assets?: {
        [assetId: string]: {
          balance: string;
          sponsorBalance: string;
          minSponsoredAssetFee: string;
        };
      };
    }
  >
>({}, ACTION.UPDATE_BALANCES);
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

export const messages = (
  state: unknown[] = [],
  action: { type: string; payload: { unapprovedMessages: unknown[] } }
) => {
  if (action.type === ACTION.UPDATE_MESSAGES) {
    return [...action.payload.unapprovedMessages];
  }

  return state;
};

export const assets = (
  state: Record<string, AssetDetail> = {},
  action: { type: string; payload: Record<string, AssetDetail> }
) => {
  if (action.type === ACTION.UPDATE_ASSET) {
    return { ...state, ...action.payload };
  }

  return state;
};

export const nfts = createSimpleReducer<AssetDetail[]>([], ACTION.UPDATE_NFTS);

export const txHistory = createSimpleReducer<Array<ITransaction & WithId>>(
  [],
  ACTION.UPDATE_TX_HISTORY
);

export const aliases = createSimpleReducer<string[]>([], ACTION.UPDATE_ALIASES);

export const backTabs = (
  state: unknown[] = [],
  { type, payload }: { type: string; payload: unknown }
) => {
  if (type === ACTION.ADD_BACK_TAB) {
    state = [...state, payload].slice(-MAX_HISTORY);
  } else if (type === ACTION.REMOVE_BACK_TAB) {
    state = state.slice(0, -1);
  }

  return state;
};

export const version = (state = '') => state;
