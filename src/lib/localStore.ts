import pump from 'pump';
import debounceStream from 'debounce-stream';
import asStream from 'obs-store/lib/asStream';
import * as Sentry from '@sentry/react';
import log from 'loglevel';
import { extension } from 'lib/extension';
import { createStreamSink } from 'lib/createStreamSink';
import { REVERSE_MIGRATIONS } from 'lib/reverseMigrations';
import type ObservableStore from 'obs-store';
import { NftInfo } from 'nfts';
import {
  DEFAULT_CONFIG,
  DEFAULT_IDENTITY_CONFIG,
  DEFAULT_IGNORE_ERRORS_CONFIG,
  FeeConfig,
} from '../constants';
import { TrashItem } from 'controllers/trash';
import { UiState } from 'ui/reducers/updateState';
import { Tab } from './tabsManager';
import { IdleOptions, PreferencesAccount } from 'preferences/types';
import { NotificationsStoreItem } from 'notifications/types';
import { PermissionValue } from 'permissions/types';
import { BalancesItem } from 'balances/types';
import { NetworkName } from 'networks/types';
import { MessageStoreItem } from 'messages/types';
import { AssetDetail } from 'assets/types';

const CURRENT_MIGRATION_VERSION = 1;

const CONTROLLERS = [
  'AssetInfoController',
  'CurrentAccountController',
  'IdentityController',
  'IdleController',
  'MessageController',
  'NetworkController',
  'NotificationsController',
  'PermissionsController',
  'PreferencesController',
  'RemoteConfigController',
  'StatisticsController',
  'TrashController',
  'UiStateController',
  'VaultController',
];

export async function backup() {
  const { backup, WalletController } = await extension.storage.local.get([
    'backup',
    'WalletController',
  ]);

  if (WalletController?.vault) {
    await extension.storage.local.set({
      backup: {
        ...backup,
        [WalletController.vault]: {
          timestamp: Date.now(),
          version: extension.runtime.getManifest().version,
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

export async function reset() {
  const state = await extension.storage.local.get();
  await extension.storage.local.remove(
    Object.keys(state).reduce<string[]>(
      (acc, key) => (SAFE_FIELDS.has(key) ? acc : [...acc, key]),
      []
    )
  );
  await extension.runtime.reload();
}

export interface StoreLocalState {
  accounts: PreferencesAccount[];
  addresses: Record<string, string>;
  assetLogos: Record<string, string>;
  assets: Record<NetworkName, Record<string, AssetDetail>>;
  assetTickers: Record<string, string>;
  backup: string;
  balances: Record<string, BalancesItem>;
  blacklist: string[];
  config: {
    networks: typeof DEFAULT_CONFIG.NETWORKS;
    network_config: typeof DEFAULT_CONFIG.NETWORK_CONFIG;
    messages_config: typeof DEFAULT_CONFIG.MESSAGES_CONFIG;
    pack_config: typeof DEFAULT_CONFIG.PACK_CONFIG;
    idle: typeof DEFAULT_CONFIG.IDLE;
  };
  cognitoSessions: string | undefined;
  currentLocale: string;
  currentNetwork: NetworkName;
  currentNetworkAccounts: PreferencesAccount[];
  customCodes: Record<NetworkName, string | null | undefined>;
  customMatchers: Record<NetworkName, string | null | undefined>;
  customNodes: Record<NetworkName, string | null | undefined>;
  data: TrashItem[];
  feeConfig: FeeConfig;
  identityConfig: typeof DEFAULT_IDENTITY_CONFIG;
  idleOptions: IdleOptions;
  ignoreErrorsConfig: typeof DEFAULT_IGNORE_ERRORS_CONFIG;
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
  nfts: Record<string, NftInfo>;
  notifications: NotificationsStoreItem[];
  notificationWindowId: string | undefined;
  origins: Record<string, PermissionValue[]>;
  selectedAccount: PreferencesAccount | undefined;
  status: number;
  suspiciousAssets: string[];
  tabs: Record<string, Tab>;
  uiState: UiState;
  usdPrices: Record<string, string>;
  userId: string | undefined;
  WalletController: {
    vault: string | undefined;
  };
  whitelist: string[];
}

export interface StoreSessionState {
  memo?: Record<string, string | null>;
  password?: string | null | undefined;
}

export default class ExtensionStore {
  private _state: Partial<StoreLocalState> | undefined;
  private _initState: StoreLocalState | undefined;
  private _initSession: StoreSessionState | undefined;

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
    K extends keyof StoreLocalState,
    F extends keyof StoreLocalState
  >(
    defaults: Pick<StoreLocalState, K> | StoreLocalState,
    forced?: Pick<StoreLocalState, F> | StoreLocalState
  ): Pick<StoreLocalState, K> {
    const defaultsInitState = (Object.keys(defaults) as K[]).reduce(
      (acc, key) =>
        Object.prototype.hasOwnProperty.call(this._initState, key)
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            { ...acc, [key]: this._initState![key] }
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
      (Object.keys(this._initState!) as (keyof StoreLocalState)[]).reduce<
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
            ) as StoreLocalState
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

  getState<K extends keyof StoreLocalState>(
    keys?: K | K[]
  ): Pick<StoreLocalState, K> {
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

  async get<K extends keyof StoreLocalState>(
    keys?: K | K[]
  ): Promise<Pick<StoreLocalState, K>> {
    const storageState = extension.storage.local;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await this._get(storageState, keys)) as any;
  }

  private async getSession(
    keys?: string | string[]
  ): Promise<StoreSessionState> {
    const storageState = extension.storage.session;

    if (!storageState) return {};

    return await this._get(storageState, keys);
  }

  async set(state: StoreLocalState) {
    const storageState = extension.storage.local;
    this._state = { ...this._state, ...state };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this._set(storageState, state as any);
  }

  async setSession(state: StoreSessionState) {
    const storageState = extension.storage.session;

    if (!storageState) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this._set(storageState, state as any);
  }

  private _get(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storageState: any,
    keys?: string | string[]
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storageState.get(keys, (result: any) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storageState: any,
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
        const migrations = [this._migrateFlatState.bind(this)];
        for (let i = version; i < CURRENT_MIGRATION_VERSION; i++) {
          await migrations[i]();
        }
      } else if (version > CURRENT_MIGRATION_VERSION) {
        for (let i = version; i > CURRENT_MIGRATION_VERSION; i--) {
          const reverseMigrate = REVERSE_MIGRATIONS[i - 1];
          if (reverseMigrate) {
            await reverseMigrate.bind(this)();
          }
        }
      }

      await this._set(storageState, {
        migrationVersion: CURRENT_MIGRATION_VERSION,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  private async _migrateFlatState() {
    const storageState = extension.storage.local;

    // this should potentially fix FILE_ERROR_NO_SPACE error
    await this._remove(storageState, ['AssetInfoController']);

    const state = await this._get(storageState);
    const migrateFields = CONTROLLERS.filter(controller => state[controller]);

    if (migrateFields.length === 0) {
      return;
    }

    await this._set(
      storageState,
      migrateFields.reduce(
        (acc, field) => ({
          ...acc,
          ...(state[field] as Record<string, unknown>),
        }),
        {}
      )
    );
    await this._remove(storageState, migrateFields);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _remove(storageState: any, keys: string | string[]) {
    if (typeof keys === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (this._state as any)[keys];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keys.forEach(key => delete (this._state as any)[key]);
    }

    return new Promise<void>((resolve, reject) => {
      storageState.remove(keys, () => {
        const err = extension.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
