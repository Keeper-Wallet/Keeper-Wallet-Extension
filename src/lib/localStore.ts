import * as extension from 'extensionizer';
import * as Sentry from '@sentry/react';
import { REVERSE_MIGRATIONS } from 'lib/reverseMigrations';

const CURRENT_MIGRATION_VERSION = 0;

export default class ExtensionStore {
  async get() {
    const result = await this._get();

    if (isEmpty(result)) {
      return undefined;
    } else {
      return result;
    }
  }

  async set(state: Record<string, unknown>) {
    return this._set(state);
  }

  async migrate() {
    try {
      const { migrationVersion } = await this._get();
      const version = (migrationVersion as number) || 0;

      if (version > CURRENT_MIGRATION_VERSION) {
        for (let i = version; i > CURRENT_MIGRATION_VERSION; i--) {
          const reverseMigrate = REVERSE_MIGRATIONS[i - 1];
          if (reverseMigrate) {
            await reverseMigrate.call(this);
          }
        }
      }

      await this._set({
        migrationVersion: CURRENT_MIGRATION_VERSION,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  _get(): Promise<Record<string, unknown>> {
    const local = extension.storage.local;
    return new Promise((resolve, reject) => {
      local.get(null, result => {
        const err = extension.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  _set(obj: Record<string, unknown>): Promise<void> {
    const local = extension.storage.local;
    return new Promise((resolve, reject) => {
      local.set(obj, () => {
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

function isEmpty(obj: Record<string, unknown>) {
  return Object.keys(obj).length === 0;
}
