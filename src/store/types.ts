import type { Dispatch, MiddlewareAPI } from 'redux';
import type { StorageLocalState } from 'storage/storage';

import type { AssetsRecord } from '../assets/types';
import type { BalancesItem } from '../balances/types';
import type { NftConfig } from '../constants';
import type { Message } from '../messages/types';
import type { NetworkName } from '../networks/types';
import type { NftInfo } from '../nfts/nfts';
import type { NotificationsStoreItem } from '../notifications/types';
import type { PermissionValue } from '../permissions/types';
import type { PopupState } from '../popup/store/types';
import type { IdleOptions, PreferencesAccount } from '../preferences/types';
import type { ACTION } from './actions/constants';
import type { NewAccountState, UiState } from './reducers/updateState';

export type AppAction =
  | {
      type: typeof ACTION.REMOTE_CONFIG.SET_CONFIG;
      payload: Partial<StorageLocalState['config']>;
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
      payload: UiState;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_CURRENT_NETWORK;
      payload: NetworkName;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_ORIGINS;
      payload: Partial<Record<string, PermissionValue[]>>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_MESSAGES;
      payload: Message[];
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
        allMessages: Message[] | undefined;
        messages: Message[];
        notifications: NotificationsStoreItem[][];
      };
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_SELECTED_ACCOUNT;
      payload: PreferencesAccount;
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
      payload: AssetsRecord;
      meta?: never;
    }
  | {
      type: typeof ACTION.SET_USD_PRICES;
      payload: Partial<Record<string, string>>;
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
      type: typeof ACTION.SELECT_ACCOUNT;
      payload: PreferencesAccount;
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
      type: typeof ACTION.SET_LOADING;
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
      type: typeof ACTION.MESSAGES.UPDATE_ACTIVE;
      payload: null;
      meta?: never;
    }
  | {
      type: typeof ACTION.MESSAGES.SET_ACTIVE_MESSAGE;
      payload: Message | undefined;
      meta?: never;
    }
  | {
      type: typeof ACTION.MESSAGES.SET_ACTIVE_NOTIFICATION;
      payload: NotificationsStoreItem[] | undefined;
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
      type: typeof ACTION.NOTIFICATIONS.SET_PERMS;
      payload: {
        origin: string;
        canUse: boolean | null;
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
      type: typeof ACTION.SET_UI_STATE;
      payload: UiState;
      meta?: never;
    }
  | {
      type: typeof ACTION.GET_ASSETS;
      payload: string;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_SWAPPABLE_ASSETS;
      payload: Record<string, string[]>;
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
      type: typeof ACTION.CHANGE_NODE;
      payload: { node: string | null; network: NetworkName };
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_NETWORK_CODE;
      payload: { code: string | null; network: NetworkName };
      meta?: never;
    }
  | {
      type: typeof ACTION.CHANGE_MATCHER;
      payload: { matcher: string | null; network: NetworkName };
      meta?: never;
    };

export type AppActionOfType<T extends AppAction['type']> = Extract<
  AppAction,
  { type: T }
>;

export type AppActionPayload<T extends AppAction['type']> =
  AppActionOfType<T>['payload'];

export type AppMiddleware = (
  api: MiddlewareAPI<Dispatch, PopupState>,
) => (next: Dispatch<AppAction>) => (action: AppAction) => void;
