/* eslint-disable @typescript-eslint/no-this-alias */
const apis = [
  'action',
  'alarms',
  'bookmarks',
  'browserAction',
  'commands',
  'contextMenus',
  'cookies',
  'downloads',
  'events',
  'extension',
  'extensionTypes',
  'history',
  'i18n',
  'idle',
  'notifications',
  'pageAction',
  'runtime',
  'storage',
  'tabs',
  'webNavigation',
  'webRequest',
  'windows',
];

const hasChrome = typeof chrome !== 'undefined';
const hasWindow = typeof window !== 'undefined';
const hasBrowser = typeof browser !== 'undefined';

function Extension() {
  const _this = this;

  apis.forEach(function (api) {
    _this[api] = null;

    if (hasChrome) {
      try {
        if (chrome[api]) {
          _this[api] = chrome[api];
        }
      } catch (e) {
        // do nothing
      }
    }

    if (hasWindow) {
      try {
        if (window[api]) {
          _this[api] = window[api];
        }
      } catch (e) {
        // do nothing
      }
    }

    if (hasBrowser) {
      try {
        if (browser[api]) {
          _this[api] = browser[api];
        }
      } catch (e) {
        // do nothing
      }
      try {
        _this.api = browser.extension[api];
      } catch (e) {
        // do nothing
      }
    }
  });

  if (hasBrowser) {
    try {
      if (browser && browser.runtime) {
        this.runtime = browser.runtime;
      }
    } catch (e) {
      // do nothing
    }

    try {
      if (browser && browser.browserAction) {
        this.browserAction = browser.browserAction;
      }
    } catch (e) {
      // do nothing
    }
  }
}

export const extension = new Extension();
