import * as pump from 'pump';
import * as debounceStream from 'debounce-stream';
import * as asStream from 'obs-store/lib/asStream';
import * as Sentry from '@sentry/react';
import log from 'loglevel';
import { extension } from 'lib/extension';
import { createStreamSink } from 'lib/createStreamSink';
import { REVERSE_MIGRATIONS } from 'lib/reverseMigrations';

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

const SAFE_FIELDS = new Set([
  'WalletController',
  'accounts',
  'addresses',
  'lastIdleKeeper',
  'lastInstallKeeper',
  'lastOpenKeeper',
  'userId',
]);

export async function reset() {
  const state = await extension.storage.local.get();
  await extension.storage.local.remove(
    Object.keys(state).reduce(
      (acc, key) => (SAFE_FIELDS.has(key) ? acc : [...acc, key]),
      []
    )
  );
  await extension.runtime.reload();
}

export default class ExtensionStore {
  private _state: Record<string, unknown>;
  private _initState: Record<string, unknown>;
  private _initSession: Record<string, unknown>;

  async create() {
    await this._migrate();

    this._state = { migrationVersion: CURRENT_MIGRATION_VERSION };
    this._initState = await this.get();
    this._initSession = await this.getSession();
  }

  getInitState(defaults?: Record<string, unknown>) {
    if (!defaults) {
      return this._initState;
    }

    const defaultsInitState = Object.keys(defaults).reduce(
      (acc, key) =>
        Object.prototype.hasOwnProperty.call(this._initState, key)
          ? { ...acc, [key]: this._initState[key] }
          : acc,
      {}
    );
    const initState = { ...defaults, ...defaultsInitState };
    this._state = { ...this._state, ...initState };
    return initState;
  }

  getInitSession() {
    return this._initSession;
  }

  async clear() {
    const storageState = extension.storage.local;

    const keysToRemove = Object.keys(this._initState).reduce(
      (acc, key) => (this._state[key] ? acc : [...acc, key]),
      []
    );
    await this._remove(storageState, keysToRemove);
  }

  subscribe(store) {
    pump(
      asStream(store),
      debounceStream(200),
      createStreamSink(async state => {
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
            )
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

  getState(keys?: string | string[]) {
    if (!keys) {
      return this._state;
    }

    if (typeof keys === 'string') {
      return { [keys]: this._state[keys] };
    }

    return keys.reduce(
      (acc, key) =>
        this._state[key] ? { ...acc, [key]: this._state[key] } : acc,
      {}
    );
  }

  async get(keys?: string | string[]) {
    const storageState = extension.storage.local;
    return await this._get(storageState, keys);
  }

  async getSession(keys?: string | string[]) {
    const storageState = extension.storage.session;

    if (!storageState) return {};

    return await this._get(storageState, keys);
  }

  async set(state: Record<string, unknown>) {
    const storageState = extension.storage.local;
    this._state = { ...this._state, ...state };
    return this._set(storageState, state);
  }

  async setSession(state: Record<string, unknown>) {
    const storageState = extension.storage.session;

    if (!storageState) return;

    return this._set(storageState, state);
  }

  _get(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storageState: any,
    keys?: string | string[]
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      storageState.get(keys, result => {
        const err = extension.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _set(storageState: any, state: Record<string, unknown>): Promise<void> {
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

  async _migrate() {
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

  async _migrateFlatState() {
    const storageState = extension.storage.local;

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
  _remove(storageState: any, keys: string | string[]): Promise<void> {
    if (typeof keys === 'string') {
      delete this._state[keys];
    } else {
      keys.forEach(key => delete this._state[key]);
    }

    return new Promise((resolve, reject) => {
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
