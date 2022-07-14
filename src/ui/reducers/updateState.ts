import { Account, NetworkName } from 'accounts/types';
import { ACTION } from '../actions';
import { AssetDetail } from '../services/Background';
import { TransactionFromNode } from '@waves/ts-types';
import { NftInfo } from 'nfts';
import { Nft } from 'nfts/utils';
import { Message } from 'ui/components/transactions/BaseTransaction';

export * from './localState';
export * from './feeConfig';
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

export const tab = createSimpleReducer(null, ACTION.CHANGE_TAB);

export type AssetFilters = {
  term?: string;
  onlyMy?: boolean;
  onlyFavorites?: boolean;
};
export type NftFilters = {
  term?: string;
  creator?: string;
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
  currentAsset?: AssetDetail | Nft;
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

export function selectedAccount(
  state: Account = {} as Account,
  action: { type: string; payload: Account }
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
  NetworkName,
  typeof ACTION.UPDATE_CURRENT_NETWORK
>(NetworkName.Mainnet, ACTION.UPDATE_CURRENT_NETWORK);

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
  txHistory: Array<TransactionFromNode>;
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
export const langs = createSimpleReducer([], ACTION.UPDATE_LANGS);
export const origins = createSimpleReducer({}, ACTION.UPDATE_ORIGINS);
export const idleOptions = createSimpleReducer(
  {},
  ACTION.REMOTE_CONFIG.UPDATE_IDLE
);

export const messages = (
  state: Message[] = [],
  action: { type: string; payload: { unapprovedMessages: Message[] } }
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

export const usdPrices = createSimpleReducer<Record<string, string>>(
  {},
  ACTION.SET_USD_PRICES
);

export const assetLogos = createSimpleReducer<Record<string, string>>(
  {},
  ACTION.SET_ASSET_LOGOS
);

export const assetIds = createSimpleReducer<Record<string, string>>(
  {},
  ACTION.SET_ASSET_IDS
);

export const addresses = createSimpleReducer<Record<string, string>>(
  {},
  ACTION.UPDATE_ADDRESSES
);

export const nfts = createSimpleReducer<Record<string, NftInfo>>(
  null,
  ACTION.UPDATE_NFTS
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
