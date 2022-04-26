const { extension } = require('lib/extension');
const log = require('loglevel');

/**
 * A wrapper around the extension's storage local API
 */
module.exports = class ExtensionStore {
  /**
   * @constructor
   */
  constructor() {
    this.isSupported = !!extension.storage.local;

    if (!this.isSupported) {
      log.error('Storage local API not available.');
    }

    if (!extension.storage.session) {
      log.error('Storage session API not available.');
    }
  }

  /**
   * Returns all of the keys currently saved
   * @return {Promise<*>}
   */
  async get() {
    const storageState = extension.storage.local;

    if (!storageState) return undefined;
    const result = await this._get(storageState);
    // extension.storage.local always returns an obj
    // if the object is empty, treat it as undefined
    return isEmpty(result) ? undefined : result;
  }

  /**
   * Returns all of the keys currently saved
   * @return {Promise<*>}
   */
  async getSession() {
    const storageState = extension.storage.session;

    if (!storageState) return undefined;
    const result = await this._get(storageState);
    // extension.storage.local always returns an obj
    // if the object is empty, treat it as undefined
    return isEmpty(result) ? undefined : result;
  }

  /**
   * Sets the key in local state
   * @param {object} state - The state to set
   * @return {Promise<void>}
   */
  async set(state) {
    const storageState = extension.storage.local;

    if (!storageState) return;
    return this._set(storageState, state);
  }

  /**
   * Sets the key in local state
   * @param {object} state - The state to set
   * @return {Promise<void>}
   */
  async setSession(state) {
    const storageState = extension.storage.session;

    if (!storageState) return;
    return this._set(storageState, state);
  }

  /**
   * Returns all of the keys currently saved
   * @private
   * @param {object} storageState
   * @return {object} the key-value map from local storage
   */
  _get(storageState) {
    return new Promise((resolve, reject) => {
      storageState.get(null, (/** @type {any} */ result) => {
        const err = extension.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Sets the key in local state
   * @param {object} storageState
   * @param {object} state - The key to set
   * @return {Promise<void>}
   * @private
   */
  _set(storageState, state) {
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
};

/**
 * Returns whether or not the given object contains no keys
 * @param {object} obj - The object to check
 * @returns {boolean}
 */
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
