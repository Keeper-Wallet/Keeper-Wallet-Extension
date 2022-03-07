import { Account, NetworkName } from 'accounts/types';
import { ACTION } from '../actions';
import { AssetDetail } from '../services/Background';
import {
  ITransaction,
  WithId,
} from '@waves/waves-transactions/dist/transactions';
import { ISignTxData } from '@waves/ledger/lib/Waves';

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

export type AssetFilters = {
  term?: string;
  onlyMy?: boolean;
  onlyFavorites?: boolean;
};
export type NftFilters = {
  term?: string;
  onlyMy?: boolean;
};
export type TxHistoryFilters = {
  term?: string;
  type?: number;
  onlyIncoming?: boolean;
  onlyOutgoing?: boolean;
};

export interface UiState {
  account?: unknown;
  assetFilters?: AssetFilters;
  assetsTab?: number;
  autoClickProtection?: boolean;
  currentAsset?: AssetDetail;
  isFeatureUpdateShown?: boolean;
  nftFilters?: NftFilters;
  showSuspiciousAssets?: boolean;
  slippageToleranceIndex?: number;
  txHistoryFilters?: TxHistoryFilters;
}

export const uiState = createSimpleReducer<UiState>({}, ACTION.UPDATE_UI_STATE);
export const accounts = createSimpleReducer<Account[]>(
  [],
  ACTION.UPDATE_ACCOUNTS
);
export const allNetworksAccounts = createSimpleReducer<Account[]>(
  [],
  ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS
);
export const state = createSimpleReducer(null, ACTION.UPDATE_APP_STATE);

interface SelectedAccountState {
  address?: string;
  name?: string;
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

export const networks = createSimpleReducer<
  Array<{
    code: string;
    matcher: string;
    name: string;
    server: string;
  }>
>([], ACTION.UPDATE_NETWORKS);

export const currentNetwork = createSimpleReducer<
  'custom' | 'mainnet' | 'stagenet' | 'testnet',
  typeof ACTION.UPDATE_CURRENT_NETWORK
>('mainnet', ACTION.UPDATE_CURRENT_NETWORK);

export interface AssetBalance {
  balance: string;
  sponsorBalance: string;
  minSponsoredAssetFee: string;
}

export type BalanceAssets = {
  [assetId: string]: AssetBalance;
};

export interface AccountBalance {
  available: string;
  leasedOut: string;
  assets?: BalanceAssets;
  aliases: string[];
  nfts: AssetDetail[];
  txHistory: Array<ITransaction & WithId>;
}

export const balances = createSimpleReducer<{
  [address: string]: AccountBalance;
}>({}, ACTION.UPDATE_BALANCES);

export const currentLocale = createSimpleReducer('en', ACTION.UPDATE_FROM_LNG);
export const customNodes = createSimpleReducer({}, ACTION.UPDATE_NODES);
export const customCodes = createSimpleReducer<
  Partial<Record<NetworkName, string>>
>({}, ACTION.UPDATE_CODES);
export const customMatcher = createSimpleReducer({}, ACTION.UPDATE_MATCHER);
export const langs = createSimpleReducer({}, ACTION.UPDATE_LANGS);
export const origins = createSimpleReducer({}, ACTION.UPDATE_ORIGINS);
export const idleOptions = createSimpleReducer(
  {},
  ACTION.REMOTE_CONFIG.UPDATE_IDLE
);

export type LedgerSignRequest = { id: string } & {
  type: 'transaction';
  data: ISignTxData;
};

export interface LedgerSignRequestsAddAction {
  type: typeof ACTION.LEDGER_SIGN_REQUESTS_ADD;
  payload: LedgerSignRequest;
}

export interface LedgerSignRequestsClearAction {
  type: typeof ACTION.LEDGER_SIGN_REQUESTS_CLEAR;
}

export function ledgerSignRequests(
  state: LedgerSignRequest[] = [],
  action: LedgerSignRequestsAddAction | LedgerSignRequestsClearAction
) {
  switch (action.type) {
    case ACTION.LEDGER_SIGN_REQUESTS_ADD:
      return state.concat(action.payload);
    case ACTION.LEDGER_SIGN_REQUESTS_CLEAR:
      return [];
    default:
      return state;
  }
}

export const messages = (
  state: unknown[] = [],
  action: { type: string; payload: { unapprovedMessages: unknown[] } }
) => {
  if (action.type === ACTION.UPDATE_MESSAGES) {
    return [...action.payload.unapprovedMessages];
  }

  return state;
};

export const assets = createSimpleReducer<Record<string, AssetDetail>>(
  {},
  ACTION.SET_ASSETS
);

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
