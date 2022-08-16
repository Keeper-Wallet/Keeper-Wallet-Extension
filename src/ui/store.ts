import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  applyMiddleware,
  combineReducers,
  createStore,
  Dispatch,
  MiddlewareAPI,
} from 'redux';
import * as reducers from './reducers/updateState';
import {
  NewAccountState,
  SwapScreenInitialState,
  TabMode,
  UiState,
} from './reducers/updateState';
import * as middleware from './midleware';
import { extension } from 'lib/extension';
import { KEEPERWALLET_DEBUG } from './appConfig';
import type { ACTION } from './actions/constants';
import {
  BackgroundGetStateResult,
  BackgroundUiApi,
  WalletTypes,
} from './services/Background';
import { FeeConfig, NftConfig } from '../constants';
import { IdleOptions, PreferencesAccount } from 'preferences/types';
import { PermissionValue } from 'permissions/types';
import { NotificationsStoreItem } from 'notifications/types';
import { BalancesItem } from 'balances/types';
import { NftInfo } from 'nfts';
import { BatchAddAccountsPayload } from './actions/user';
import { IMoneyLike } from './utils/converters';
import { NetworkName } from 'networks/types';
import { MessageInputOfType, MessageStoreItem } from 'messages/types';
import { AssetDetail } from 'assets/types';

const middlewares = Object.values(middleware);

if (KEEPERWALLET_DEBUG) {
  middlewares.push(() => next => action => {
    console.log('-->', action.type, action.payload, action.meta);
    return next(action);
  });
}

const reducer = combineReducers(reducers);

export type AppState = ReturnType<typeof reducer>;

export type UiAction =
  | {
      type: typeof ACTION.UPDATE_LANGS;
      payload: Array<{ id: string; name: string }>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_NETWORKS;
      payload: Awaited<ReturnType<BackgroundUiApi['getNetworks']>>;
      meta?: never;
    }
  | {
      type: typeof ACTION.REMOTE_CONFIG.SET_CONFIG;
      payload: Partial<BackgroundGetStateResult['config']>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_FEE_CONFIG;
      payload: FeeConfig;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_NFT_CONFIG;
      payload: NftConfig;
      meta?: never;
    }
  | {
      type: typeof ACTION.REMOTE_CONFIG.UPDATE_IDLE;
      payload: Partial<IdleOptions>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_NODES;
      payload: Partial<Record<NetworkName, string | null>>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_CODES;
      payload: Partial<Record<NetworkName, string | null>>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_MATCHER;
      payload: Partial<Record<NetworkName, string | null>>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_FROM_LNG;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_UI_STATE;
      payload: reducers.UiState;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_CURRENT_NETWORK;
      payload: NetworkName;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_ORIGINS;
      payload: Record<string, PermissionValue[]>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_MESSAGES;
      payload: {
        unapprovedMessages: MessageStoreItem[];
        messages: MessageStoreItem[];
      };
      meta?: never;
    }
  | {
      type: typeof ACTION.NOTIFICATIONS.SET;
      payload: NotificationsStoreItem[][];
      meta?: never;
    }
  | {
      type: typeof ACTION.NOTIFICATIONS.SET_ACTIVE;
      payload: NotificationsStoreItem[] | null | undefined;
      meta?: never;
    }
  | {
      type: typeof ACTION.MESSAGES.SET_ACTIVE_AUTO;
      payload: {
        allMessages: MessageStoreItem[] | undefined;
        messages: MessageStoreItem[];
        notifications: NotificationsStoreItem[][];
      };
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_SELECTED_ACCOUNT;
      payload: Partial<PreferencesAccount>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_CURRENT_NETWORK_ACCOUNTS;
      payload: PreferencesAccount[];
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS;
      payload: PreferencesAccount[];
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_APP_STATE;
      payload: {
        initialized: boolean | null | undefined;
        locked: boolean | null | undefined;
      } | null;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_BALANCES;
      payload: Partial<Record<string, BalancesItem>>;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_ASSETS;
      payload: Record<string, AssetDetail>;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_USD_PRICES;
      payload: Record<string, string>;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_ASSET_LOGOS;
      payload: Record<string, string>;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_ASSET_TICKERS;
      payload: Record<string, string>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_ADDRESSES;
      payload: Record<string, string>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_NFTS;
      payload: Record<string, NftInfo> | null;
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_TAB;
      payload: string | null;
      meta?: never;
    }
  | {
      type: typeof ACTION.SELECT_ACCOUNT;
      payload: PreferencesAccount;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_TAB_MODE;
      payload: TabMode;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_SWAP_SCREEN_INITIAL_STATE;
      payload: SwapScreenInitialState;
      meta?: never;
    }
  | {
      type: typeof ACTION.RESET_SWAP_SCREEN_INITIAL_STATE;
      payload?: never;
      meta?: never;
    }
  | {
      type: typeof ACTION.APPROVE_PENDING;
      payload: boolean;
      meta?: never;
    }
  | {
      type: typeof ACTION.APPROVE_OK;
      payload: string | boolean;
      meta?: never;
    }
  | {
      type: typeof ACTION.APPROVE_ERROR;
      payload:
        | boolean
        | {
            error: unknown;
            message: unknown;
          };
      meta?: never;
    }
  | {
      type: typeof ACTION.REJECT_OK;
      payload: string | boolean;
      meta?: never;
    }
  | {
      type: typeof ACTION.APPROVE_REJECT_CLEAR;
      payload: boolean | void;
      meta?: never;
    }
  | {
      type: typeof ACTION.NOTIFICATION_SELECT;
      payload: boolean;
      meta?: never;
    }
  | {
      type: typeof ACTION.NOTIFICATION_DELETE;
      payload: boolean;
      meta?: never;
    }
  | {
      type: typeof ACTION.NOTIFICATION_NAME_CHANGED;
      payload: boolean;
      meta?: never;
    }
  | {
      type: typeof ACTION.LOADING;
      payload: boolean;
      meta?: never;
    }
  | {
      type: typeof ACTION.NEW_ACCOUNT_NAME;
      payload: string | null | undefined;
      meta?: never;
    }
  | {
      type: typeof ACTION.NEW_ACCOUNT_SELECT;
      payload: NewAccountState;
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_MENU;
      payload: { logo: boolean };
      meta?: never;
    }
  | {
      type: typeof ACTION.LOGIN_UPDATE;
      payload: Record<never, unknown>;
      meta?: never;
    }
  | {
      type: typeof ACTION.LOGIN_PENDING;
      payload: Record<never, unknown>;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_ACTIVE_ACCOUNT;
      payload: PreferencesAccount;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_PASSWORD_PENDING;
      payload: { unapprovedMessages?: Record<never, unknown> };
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_PASSWORD_UPDATE;
      payload: { unapprovedMessages?: Record<never, unknown> };
      meta?: never;
    }
  | {
      type: typeof ACTION.MESSAGES.UPDATE_ACTIVE;
      payload: null;
      meta?: never;
    }
  | {
      type: typeof ACTION.MESSAGES.SET_ACTIVE_MESSAGE;
      payload: MessageStoreItem | null;
      meta?: never;
    }
  | {
      type: typeof ACTION.MESSAGES.SET_ACTIVE_NOTIFICATION;
      payload: NotificationsStoreItem[] | null;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.PENDING;
      payload?: never;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW;
      payload?: never;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.CONFIRMED_DISALLOW;
      payload?: never;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.CONFIRMED_DELETE;
      payload?: never;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.ALLOW;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.SET_AUTO;
      payload: {
        origin: string | undefined;
        params: Partial<{
          type: 'allowAutoSign';
          totalAmount: string | null;
          interval: number | null;
          approved?: unknown[];
        }>;
      };
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.DISALLOW;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.DELETE;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.PENDING;
      payload: boolean;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW;
      payload: unknown;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.CONFIRMED_AUTO;
      payload: unknown;
      meta?: never;
    }
  | {
      type: typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW;
      payload: unknown;
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_LNG;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.NOTIFICATIONS.DELETE;
      payload:
        | string[]
        | {
            ids: string[];
            next: NotificationsStoreItem[] | null;
          };
      meta?: never;
    }
  | {
      type: typeof ACTION.NOTIFICATIONS.SET_PERMS;
      payload: {
        origin: string;
        canUse: boolean;
      };
      meta?: never;
    }
  | {
      type: typeof ACTION.REMOTE_CONFIG.SET_IDLE;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.GET_BALANCES;
      payload?: never;
      meta?: never;
    }
  | {
      type: typeof ACTION.DELETE_ACTIVE_ACCOUNT;
      payload: void;
      meta?: never;
    }
  | {
      type: typeof ACTION.CLOSE_WINDOW;
      payload: void;
      meta?: never;
    }
  | {
      type: typeof ACTION.DELETE_ACCOUNT;
      payload?: never;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_UI_STATE;
      payload: UiState;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_UI_STATE_AND_TAB;
      payload: { ui: UiState; tab: string | null };
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_NETWORK;
      payload: NetworkName;
      meta?: never;
    }
  | {
      type: typeof ACTION.GET_ASSETS;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_ASSETS;
      payload: string[];
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_ADDRESS;
      payload: { address: string; name: string };
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_ADDRESSES;
      payload: Record<string, string>;
      meta?: never;
    }
  | {
      type: typeof ACTION.REMOVE_ADDRESS;
      payload: { address: string };
      meta?: never;
    }
  | {
      type: typeof ACTION.FAVORITE_ASSET;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_ACCOUNT_NAME;
      payload: { address: string; name: string };
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_NODE;
      payload: { node: string | null | undefined; network: NetworkName };
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_NETWORK_CODE;
      payload: { code: string | undefined; network: NetworkName };
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_MATCHER;
      payload: { network: NetworkName; matcher: string | null | undefined };
      meta?: never;
    }
  | {
      type: typeof ACTION.LOCK;
      payload?: never;
      meta?: never;
    }
  | {
      type: typeof ACTION.SIGN_AND_PUBLISH_TRANSACTION;
      payload: MessageInputOfType<'transaction'>['data'];
      meta?: never;
    }
  | {
      type: typeof ACTION.SAVE_NEW_ACCOUNT;
      payload:
        | {
            type: 'seed';
            name: string;
            seed: string;
          }
        | {
            type: 'encodedSeed';
            encodedSeed: string;
            name: string;
          }
        | {
            type: 'privateKey';
            name: string;
            privateKey: string;
          }
        | {
            type: 'wx';
            name: string;
            publicKey: string;
            address: string | null;
            uuid: string;
            username: string;
          }
        | {
            type: 'ledger';
            address: string | null;
            id: number;
            name: string;
            publicKey: string;
          }
        | {
            type: 'debug';
            address: string;
            name: string;
            networkCode: string;
          };
      meta: { type: WalletTypes };
    }
  | {
      type: typeof ACTION.BATCH_ADD_ACCOUNTS;
      payload: BatchAddAccountsPayload;
      meta: { type: WalletTypes };
    }
  | {
      type: typeof ACTION.LOGIN;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_TRANSACTION_FEE;
      payload: { messageId: string; fee: IMoneyLike };
      meta?: never;
    }
  | {
      type: typeof ACTION.CLEAR_MESSAGES;
      payload?: never;
      meta?: never;
    }
  | {
      type: typeof ACTION.APPROVE;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.REJECT;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.REJECT_FOREVER;
      payload: { messageId: string; forever: boolean };
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_PASSWORD;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.ADD_BACK_TAB;
      payload: string | null;
      meta?: never;
    }
  | {
      type: typeof ACTION.REMOVE_BACK_TAB;
      payload: void;
      meta?: never;
    };

export type UiActionOfType<T extends UiAction['type']> = Extract<
  UiAction,
  { type: T }
>;

export type UiActionPayload<T extends UiAction['type']> =
  UiActionOfType<T>['payload'];

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export function createUiStore() {
  return createStore<
    AppState,
    UiAction,
    Record<never, unknown>,
    Record<never, unknown>
  >(
    reducer,
    { version: extension.runtime.getManifest().version },
    applyMiddleware(...middlewares)
  );
}

export type UiStore = ReturnType<typeof createUiStore>;

export type UiMiddleware = (
  api: MiddlewareAPI<Dispatch, AppState>
) => (next: Dispatch<UiAction>) => (action: UiAction) => void;

export const useAppDispatch = () => useDispatch<UiStore['dispatch']>();
