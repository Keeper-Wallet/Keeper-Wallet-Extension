import type Browser from 'webextension-polyfill';

declare module 'webextension-polyfill/namespaces/storage' {
  namespace Storage {
    interface SessionStorageArea extends Browser.Storage.StorageArea {
      /**
       * The maximum amount (in bytes) of data that can be stored in local storage, as measured by the JSON stringification of
       * every value plus every key's length. This value will be ignored if the extension has the <code>unlimitedStorage</code>
       * permission. Updates that would cause this limit to be exceeded fail immediately and set $(ref:runtime.lastError).
       */
      QUOTA_BYTES: 5242880;
    }

    interface Static {
      session?: SessionStorageArea;
    }
  }
}
