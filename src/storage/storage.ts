import * as Sentry from '@sentry/react';
import { AssetsRecord } from 'assets/types';
import { TrashItem } from 'controllers/trash';
import debounceStream from 'debounce-stream';
import { createStreamSink } from 'lib/createStreamSink';
import { extension } from 'lib/extension';
import log from 'loglevel';
import { MessageStoreItem } from 'messages/types';
import { NetworkName } from 'networks/types';
import { NftInfo } from 'nfts';
import { NotificationsStoreItem } from 'notifications/types';
import type ObservableStore from 'obs-store';
import asStream from 'obs-store/lib/asStream';
import { PermissionValue } from 'permissions/types';
import { IdleOptions, PreferencesAccount } from 'preferences/types';
import pump from 'pump';
import { UiState } from 'ui/reducers/updateState';
import * as browser from 'webextension-polyfill';

import {
  AssetsConfig,
  DEFAULT_IDENTITY_CONFIG,
  DEFAULT_LEGACY_CONFIG,
  FeeConfig,
  IgnoreErrorsConfig,
  NftConfig,
} from '../constants';
import { MIGRATIONS } from './migrations';

const CURRENT_MIGRATION_VERSION = 3;

export async function backupStorage() {
  const { backup, WalletController } = await browser.storage.local.get([
    'backup',
    'WalletController',
  ]);

  if (WalletController?.vault) {
    await browser.storage.local.set({
      backup: {
        ...backup,
        [WalletController.vault]: {
          timestamp: Date.now(),
          version: browser.runtime.getManifest().version,
        },
      },
    });
  }
}

const SAFE_FIELDS = new Set([
  'WalletController',
  'accounts',
  'addresses',
  'backup',
  'lastIdleKeeper',
  'lastInstallKeeper',
  'lastOpenKeeper',
  'userId',
]);

export async function resetStorage() {
  const state = await browser.storage.local.get();
  await browser.storage.local.remove(
    Object.keys(state).reduce<string[]>(
      (acc, key) => (SAFE_FIELDS.has(key) ? acc : [...acc, key]),
      []
    )
  );
  browser.runtime.reload();
}

export interface StorageLocalState {
  accounts: PreferencesAccount[];
  addresses: Record<string, string>;
  assetLogos: Record<string, string>;
  assets: Record<NetworkName, AssetsRecord>;
  assetsConfig: AssetsConfig;
  assetTickers: Record<string, string>;
  backup: string;
  blacklist: string[];
  config: {
    networks: typeof DEFAULT_LEGACY_CONFIG.NETWORKS;
    network_config: typeof DEFAULT_LEGACY_CONFIG.NETWORK_CONFIG;
    messages_config: typeof DEFAULT_LEGACY_CONFIG.MESSAGES_CONFIG;
    pack_config: typeof DEFAULT_LEGACY_CONFIG.PACK_CONFIG;
    idle: typeof DEFAULT_LEGACY_CONFIG.IDLE;
  };
  cognitoSessions: string | undefined;
  currentLocale: string;
  currentNetwork: NetworkName;
  customCodes: Record<NetworkName, string | null | undefined>;
  customMatchers: Record<NetworkName, string | null | undefined>;
  customNodes: Record<NetworkName, string | null | undefined>;
  data: TrashItem[];
  feeConfig: FeeConfig;
  identityConfig: typeof DEFAULT_IDENTITY_CONFIG;
  idleOptions: IdleOptions;
  ignoreErrorsConfig: IgnoreErrorsConfig;
  initialized: boolean | null;
  inPending: Record<string, string | null>;
  inShowMode: boolean | undefined;
  lastIdleKeeper: number | undefined;
  lastInstallKeeper: number | undefined;
  lastOpenKeeper: number | undefined;
  lastUpdateIdle: number;
  locked: boolean | null;
  messages: MessageStoreItem[];
  migrationVersion: number;
  nftConfig: NftConfig;
  nfts: Record<string, NftInfo>;
  notifications: NotificationsStoreItem[];
  notificationWindowId: number | undefined;
  origins: Record<string, PermissionValue[]>;
  selectedAccount: PreferencesAccount | undefined;
  status: number;
  suspiciousAssets: string[];
  tabs: Partial<Record<string, chrome.tabs.Tab>>;
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
  private _state: Partial<StorageLocalState> | undefined;
  private _initState: StorageLocalState | undefined;
  private _initSession: StorageSessionState | undefined;

  async create() {
    await this._migrate();

    this._initState = await this.get();
    this._initSession = await this.getSession();

    this._state = {
      migrationVersion: CURRENT_MIGRATION_VERSION,
      backup: this._initState.backup,
    };
  }

  getInitState<
    K extends keyof StorageLocalState,
    F extends keyof StorageLocalState
  >(
    defaults: Pick<StorageLocalState, K> | StorageLocalState,
    forced?: Pick<StorageLocalState, F> | StorageLocalState
  ): Pick<StorageLocalState, K>;
  getInitState<T extends Record<string, unknown>>(defaults: T, forced?: T): T;
  getInitState(
    defaults: Record<string, unknown>,
    forced?: Record<string, unknown>
  ) {
    const defaultsInitState = Object.keys(defaults).reduce(
      (acc, key) =>
        Object.prototype.hasOwnProperty.call(this._initState, key)
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { ...acc, [key]: (this._initState as any)[key] }
          : acc,
      {}
    );

    const initState = { ...defaults, ...defaultsInitState, ...(forced || {}) };
    this._state = { ...this._state, ...initState };
    return initState;
  }

  getInitSession() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._initSession!;
  }

  async clear() {
    const storageState = extension.storage.local;

    const keysToRemove =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (Object.keys(this._initState!) as Array<keyof StorageLocalState>).reduce<
        string[]
      >(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (acc, key) => (this._state![key] ? acc : [...acc, key]),
        []
      );
    await this._remove(storageState, keysToRemove);
  }

  subscribe(store: ObservableStore<unknown>) {
    pump(
      asStream(store),
      debounceStream(200),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createStreamSink(async (state: any) => {
        if (!state) {
          throw new Error('Updated state is missing');
        }

        try {
          await this.set(
            Object.entries(state).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [key]: value === undefined ? null : value,
              }),
              {}
            ) as StorageLocalState
          );
        } catch (err) {
          // log error so we dont break the pipeline
          log.error('error setting state in local store:', err);
        }
      }),
      error => {
        log.error('Persistence pipeline failed', error);
      }
    );
  }

  getState<K extends keyof StorageLocalState>(
    keys?: K | K[]
  ): Pick<StorageLocalState, K> {
    if (!keys) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this._state as any;
    }

    if (typeof keys === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion
      return { [keys]: this._state![keys] } as any;
    }

    return keys.reduce(
      (acc, key) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._state![key] ? { ...acc, [key]: this._state![key] } : acc,
      {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
  }

  async get<K extends keyof StorageLocalState>(
    keys?: K | K[]
  ): Promise<Pick<StorageLocalState, K>> {
    const storageState = extension.storage.local;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await this._get(storageState, keys)) as any;
  }

  private async getSession(
    keys?: string | string[]
  ): Promise<StorageSessionState> {
    const storageState = extension.storage.session;

    if (!storageState) return {};

    return await this._get(storageState, keys);
  }

  async set(state: StorageLocalState) {
    const storageState = extension.storage.local;
    this._state = { ...this._state, ...state };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this._set(storageState, state as any);
  }

  async setSession(state: StorageSessionState) {
    const storageState = extension.storage.session;

    if (!storageState) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this._set(storageState, state as any);
  }

  removeState(keys: string | string[]) {
    const state = this._state;

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

  private _get(
    storageState: chrome.storage.StorageArea,
    keys?: string | string[]
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      storageState.get(keys!, result => {
        const err = extension.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  private _set(
    storageState: chrome.storage.StorageArea,
    state: Record<string, unknown>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      storageState.set(state, () => {
        const err = extension.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async _migrate() {
    try {
      const storageState = extension.storage.local;

      const { migrationVersion } = await this._get(
        storageState,
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

      await this._set(storageState, {
        migrationVersion: CURRENT_MIGRATION_VERSION,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message.includes('FILE_ERROR_NO_SPACE')) return;

      Sentry.captureException(err);
    }
  }

  private async _remove(
    storageState: chrome.storage.StorageArea,
    keys: string | string[]
  ) {
    this.removeState(keys);
    await storageState.remove(keys);
  }
}
