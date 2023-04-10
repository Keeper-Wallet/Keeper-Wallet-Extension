import { captureException } from '@sentry/browser';
import { type AssetsRecord } from 'assets/types';
import { type TrashItem } from 'controllers/trash';
import { deepEqual } from 'fast-equals';
import { type Message } from 'messages/types';
import { type NetworkName } from 'networks/types';
import { type NftInfo } from 'nfts/nfts';
import { type NotificationsStoreItem } from 'notifications/types';
import type ObservableStore from 'obs-store';
import { type PermissionValue } from 'permissions/types';
import { type IdleOptions, type PreferencesAccount } from 'preferences/types';
import { type UiState } from 'store/reducers/updateState';
import Browser from 'webextension-polyfill';
import { make, pipe, subscribe } from 'wonka';

import {
  type AssetsConfig,
  type DEFAULT_IDENTITY_CONFIG,
  type DEFAULT_MAIN_CONFIG,
  type IgnoreErrorsConfig,
  type NftConfig,
} from '../constants';
import { MIGRATIONS } from './migrations';

const CURRENT_MIGRATION_VERSION = 3;

export async function backupStorage() {
  const { backup, WalletController } = await Browser.storage.local.get([
    'backup',
    'WalletController',
  ]);

  if (WalletController?.vault) {
    await Browser.storage.local.set({
      backup: {
        ...backup,
        [WalletController.vault]: {
          timestamp: Date.now(),
          version: Browser.runtime.getManifest().version,
        },
      },
    });
  }
}

export interface StorageLocalState {
  accounts: PreferencesAccount[];
  addresses: Record<string, string>;
  assetLogos: Record<string, string>;
  assets: Record<NetworkName, AssetsRecord>;
  swappableAssetIdsByVendor: Record<string, string[]>;
  assetsConfig: AssetsConfig;
  assetTickers: Record<string, string>;
  backup: string;
  config: {
    messages_config: typeof DEFAULT_MAIN_CONFIG.messages_config;
    pack_config: typeof DEFAULT_MAIN_CONFIG.pack_config;
    idle: typeof DEFAULT_MAIN_CONFIG.idle;
  };
  cognitoSessions: string | undefined;
  currentLocale: string;
  currentNetwork: NetworkName;
  customCodes: Record<NetworkName, string | null>;
  customMatchers: Record<NetworkName, string | null>;
  customNodes: Record<NetworkName, string | null>;
  data: TrashItem[];
  identityConfig: typeof DEFAULT_IDENTITY_CONFIG;
  idleOptions: IdleOptions;
  ignoreErrorsConfig: IgnoreErrorsConfig;
  initialized: boolean;
  inPending: Record<string, string | null>;
  inShowMode: boolean | undefined;
  lastIdleKeeper: number | undefined;
  lastOpenKeeper: number | undefined;
  lastUpdateIdle: number;
  locked: boolean;
  messages: Message[];
  migrationVersion: number;
  nftConfig: NftConfig;
  nfts: Record<string, NftInfo>;
  notifications: NotificationsStoreItem[];
  notificationWindowId: number | undefined;
  origins: Record<string, PermissionValue[]>;
  selectedAccount: PreferencesAccount | undefined;
  status: number;
  suspiciousAssets: string[];
  tabs: Partial<Record<string, Browser.Tabs.Tab>>;
  uiState: UiState;
  usdPrices: Record<string, string>;
  userId: string | undefined;
  WalletController: {
    vault: string | undefined;
  };
  whitelist: string[];
}

export interface StorageSessionState {
  memo?: Record<string, string | null>;
  password?: string | null | undefined;
}

export class ExtensionStorage {
  #localState: StorageLocalState;
  #sessionState: StorageSessionState;
  #state: Partial<StorageLocalState>;

  constructor(localState: unknown, sessionState: StorageSessionState) {
    this.#localState = localState as StorageLocalState;
    this.#sessionState = sessionState;

    this.#state = {
      migrationVersion: CURRENT_MIGRATION_VERSION,
      backup: this.#localState.backup,
    };
  }

  getInitState<K extends keyof StorageLocalState>(
    defaults: Pick<StorageLocalState, K> | StorageLocalState
  ): Pick<StorageLocalState, K>;
  getInitState<T extends Record<string, unknown>>(defaults: T, forced?: T): T;
  getInitState(defaults: Record<string, unknown>) {
    const defaultsInitState = Object.keys(defaults).reduce(
      (acc, key) =>
        Object.prototype.hasOwnProperty.call(this.#localState, key)
          ? { ...acc, [key]: this.#localState[key as keyof StorageLocalState] }
          : acc,
      {}
    );

    const initState = { ...defaults, ...defaultsInitState };
    this.#state = { ...this.#state, ...initState };
    return initState;
  }

  getInitSession() {
    return this.#sessionState;
  }

  async clear() {
    const keysToRemove = (
      Object.keys(this.#localState) as Array<keyof StorageLocalState>
    ).reduce<string[]>(
      (acc, key) => (this.#state[key] ? acc : [...acc, key]),
      []
    );

    this.removeState(keysToRemove);
    await Browser.storage.local.remove(keysToRemove);
  }

  subscribe<T extends Record<string, unknown>>(store: ObservableStore<T>) {
    pipe(
      make<T>(observer => {
        store.subscribe(observer.next);

        return () => {
          store.unsubscribe(observer.next);
        };
      }),
      subscribe(async updatedState => {
        const currentState = await Browser.storage.local.get(
          Object.keys(updatedState)
        );

        const changedState = Object.fromEntries(
          Object.entries(updatedState)
            .map(
              ([key, value]) =>
                [key, value === undefined ? null : value] as const
            )
            .filter(([key, value]) => !deepEqual(currentState[key], value))
        );

        const changedKeys = Object.keys(changedState);

        if (changedKeys.length === 0) {
          return;
        }

        this.#state = { ...this.#state, ...changedState };
        Browser.storage.local.set(changedState);
      })
    );
  }

  getState<K extends keyof StorageLocalState>(
    keys?: K | K[]
  ): Pick<StorageLocalState, K> {
    if (!keys) {
      return this.#state as Pick<StorageLocalState, K>;
    }

    if (typeof keys === 'string') {
      return { [keys]: this.#state[keys] } as Pick<StorageLocalState, K>;
    }

    return keys.reduce(
      (acc, key) =>
        this.#state[key] ? { ...acc, [key]: this.#state[key] } : acc,
      {} as Pick<StorageLocalState, K>
    );
  }

  async setSession(state: StorageSessionState) {
    return Browser.storage.session?.set(state);
  }

  removeState(keys: string | string[]) {
    const state = this.#state;

    if (state) {
      if (typeof keys === 'string') {
        if (keys in state) {
          delete state[keys as keyof typeof state];
        }
      } else {
        keys.forEach(key => {
          if (key in state) {
            delete state[key as keyof typeof state];
          }
        });
      }
    }
  }
}

export async function createExtensionStorage() {
  try {
    const { migrationVersion } = await Browser.storage.local.get(
      'migrationVersion'
    );

    const version = (migrationVersion as number) || 0;

    if (version < CURRENT_MIGRATION_VERSION) {
      for (let i = version; i < CURRENT_MIGRATION_VERSION; i++) {
        await MIGRATIONS[i].migrate();
      }
    } else if (version > CURRENT_MIGRATION_VERSION) {
      for (let i = version; i > CURRENT_MIGRATION_VERSION; i--) {
        await MIGRATIONS[i - 1].rollback();
      }
    }

    await Browser.storage.local.set({
      migrationVersion: CURRENT_MIGRATION_VERSION,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (!err.message.includes('FILE_ERROR_NO_SPACE')) {
      captureException(err);
    }
  }

  const [localState, sessionState] = await Promise.all([
    Browser.storage.local.get(),
    Browser.storage.session?.get() ?? {},
  ]);

  return new ExtensionStorage(localState, sessionState);
}
