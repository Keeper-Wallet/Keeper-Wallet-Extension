import { ACTION } from '../actions';
import { AssetDetail } from '../services/Background';
import { TransactionFromApi } from '../../transactions/types';

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
export const uiState = createSimpleReducer<{
  isFeatureUpdateShown?: boolean;
  currentAsset?: AssetDetail;
  assetsTab?: number;
  assetFilters?: AssetFilters;
  nftFilters?: NftFilters;
  txHistoryFilters?: TxHistoryFilters;
  showSuspiciousAssets?: boolean;
  autoClickProtection?: boolean;
}>({}, ACTION.UPDATE_UI_STATE);
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

export const currentNetwork = createSimpleReducer(
  '',
  ACTION.UPDATE_CURRENT_NETWORK
);

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
  txHistory: TransactionFromApi[];
}

export const balances = createSimpleReducer<{
  [address: string]: AccountBalance;
}>({}, ACTION.UPDATE_BALANCES);

export interface SwopFiExchangerData {
  A_asset_balance: string;
  A_asset_id: string;
  A_asset_init: string;
  B_asset_balance: string;
  B_asset_id: string;
  B_asset_init: string;
  active: boolean;
  commission: number;
  commission_scale_delimiter: number;
  first_harvest_height: number;
  govFees24: string;
  govFees7d: string;
  id: string;
  lpFees24: string;
  lpFees7d: string;
  share_asset_id: string;
  share_asset_supply: string;
  share_limit_on_first_harvest: string;
  stakingIncome24: string;
  stakingIncome7d: string;
  totalLiquidity: string;
  txCount24: string;
  txCount7d: string;
  version: string;
  volume24: string;
  volume7d: string;
  volume_current_period: string;
}

export const exchangers = createSimpleReducer<{
  [exchangerId: string]: SwopFiExchangerData;
}>({}, ACTION.UPDATE_EXCHANGERS);

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

export const assets = createSimpleReducer<Record<string, AssetDetail>>(
  {},
  ACTION.UPDATE_ASSETS
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
