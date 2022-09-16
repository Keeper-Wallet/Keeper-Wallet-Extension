import { ACTION } from '../actions/constants';
import { UiAction, UiActionPayload } from 'ui/store';
import { PreferencesAccount } from 'preferences/types';
import { AssetBalance } from 'balances/types';
import { NetworkName } from 'networks/types';
import { MessageStoreItem } from 'messages/types';
import { AssetDetail } from 'assets/types';

export * from './localState';
export * from './feeConfig';
export * from './nftConfig';
export * from './remoteConfig';
export * from './notifications';
export { router } from '../router';

function createSimpleReducer<TActionType extends UiAction['type']>(
  initialState: UiActionPayload<TActionType>,
  actionType: TActionType
) {
  return (
    state = initialState,
    action: UiAction
  ): UiActionPayload<TActionType> =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (actionType === action.type ? action.payload : state) as any;
}

export type AssetFilters = {
  term?: string;
  onlyMy?: boolean;
  onlyFavorites?: boolean;
};
export type NftFilters = {
  term?: string;
  creator?: string | null;
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
  currentAsset?: AssetDetail | null;
  nftFilters?: NftFilters;
  showSuspiciousAssets?: boolean;
  slippageToleranceIndex?: number;
  txHistoryFilters?: TxHistoryFilters;
}

export const uiState = createSimpleReducer({}, ACTION.UPDATE_UI_STATE);

export const accounts = createSimpleReducer(
  [],
  ACTION.UPDATE_CURRENT_NETWORK_ACCOUNTS
);

export const allNetworksAccounts = createSimpleReducer(
  [],
  ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS
);

export const state = createSimpleReducer(null, ACTION.UPDATE_APP_STATE);

export function selectedAccount(
  state: Partial<PreferencesAccount> = {},
  action: UiAction
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
  NetworkName.Mainnet,
  ACTION.UPDATE_CURRENT_NETWORK
);

export type BalanceAssets = {
  [assetId: string]: AssetBalance;
};

export const balances = createSimpleReducer({}, ACTION.UPDATE_BALANCES);

export const currentLocale = createSimpleReducer('en', ACTION.UPDATE_FROM_LNG);
export const customNodes = createSimpleReducer({}, ACTION.UPDATE_NODES);
export const customCodes = createSimpleReducer({}, ACTION.UPDATE_CODES);
export const customMatcher = createSimpleReducer({}, ACTION.UPDATE_MATCHER);
export const langs = createSimpleReducer([], ACTION.UPDATE_LANGS);
export const origins = createSimpleReducer({}, ACTION.UPDATE_ORIGINS);

export const idleOptions = createSimpleReducer(
  {},
  ACTION.REMOTE_CONFIG.UPDATE_IDLE
);

export const messages = (state: MessageStoreItem[] = [], action: UiAction) => {
  if (action.type === ACTION.UPDATE_MESSAGES) {
    return [...action.payload.unapprovedMessages];
  }

  return state;
};

export const assets = createSimpleReducer({}, ACTION.SET_ASSETS);
export const usdPrices = createSimpleReducer({}, ACTION.SET_USD_PRICES);
export const assetLogos = createSimpleReducer({}, ACTION.SET_ASSET_LOGOS);
export const assetTickers = createSimpleReducer({}, ACTION.SET_ASSET_TICKERS);
export const addresses = createSimpleReducer({}, ACTION.UPDATE_ADDRESSES);
export const nfts = createSimpleReducer(null, ACTION.UPDATE_NFTS);

export const version = (state = '') => state;
