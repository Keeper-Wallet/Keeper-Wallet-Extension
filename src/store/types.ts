import type { Dispatch, MiddlewareAPI } from 'redux';

import type { AssetsRecord } from '../assets/types';
import type { BalancesItem } from '../balances/types';
import type { FeeConfig, NftConfig } from '../constants';
import type { MessageStoreItem } from '../messages/types';
import type { NetworkName } from '../networks/types';
import type { NftInfo } from '../nfts/nfts';
import type { NotificationsStoreItem } from '../notifications/types';
import type { PermissionValue } from '../permissions/types';
import type { PopupState } from '../popup/store/types';
import type { IdleOptions, PreferencesAccount } from '../preferences/types';
import type {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from '../ui/services/Background';
import type { IMoneyLike } from '../ui/utils/converters';
import type { ACTION } from './actions/constants';
import type { NewAccountState, UiState } from './reducers/updateState';

export type AppAction =
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
      type: typeof ACTION.SELECT_ACCOUNT;
      payload: PreferencesAccount;
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
    };

export type AppActionOfType<T extends AppAction['type']> = Extract<
  AppAction,
  { type: T }
>;

export type AppActionPayload<T extends AppAction['type']> =
  AppActionOfType<T>['payload'];

export type AppMiddleware = (
  api: MiddlewareAPI<Dispatch, PopupState>
) => (next: Dispatch<AppAction>) => (action: AppAction) => void;
