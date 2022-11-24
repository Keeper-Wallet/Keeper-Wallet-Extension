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
] as const;

const hasChrome = typeof chrome !== 'undefined';
const hasWindow = typeof window !== 'undefined';
const hasBrowser = typeof browser !== 'undefined';

class Extension {
  action!: typeof chrome.action;
  alarms!: typeof chrome.alarms;
  api: unknown;
  bookmarks!: typeof chrome.bookmarks;
  browserAction!: typeof chrome.browserAction;
  commands!: typeof chrome.commands;
  contextMenus!: typeof chrome.contextMenus;
  cookies!: typeof chrome.cookies;
  downloads!: typeof chrome.downloads;
  events: unknown;
  extension!: typeof chrome.extension;
  extensionTypes: unknown;
  history!: typeof chrome.history;
  i18n!: typeof chrome.i18n;
  idle!: typeof chrome.idle;
  notifications!: typeof chrome.notifications;
  pageAction!: typeof chrome.pageAction;
  runtime!: typeof chrome.runtime;
  storage!: typeof chrome.storage;
  tabs!: typeof chrome.tabs;
  webNavigation!: typeof chrome.webNavigation;
  webRequest!: typeof chrome.webRequest;
  windows!: typeof chrome.windows;

  constructor() {
    const _this = this;

    // eslint-disable-next-line func-names
    apis.forEach(function (api) {
      if (hasChrome) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((chrome as any)[api]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            _this[api] = (chrome as any)[api];
          }
        } catch (e) {
          // do nothing
        }
      }

      if (hasWindow) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((window as any)[api]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            _this[api] = (window as any)[api];
          }
        } catch (e) {
          // do nothing
        }
      }

      if (hasBrowser) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((browser as any)[api]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            _this[api] = (browser as any)[api];
          }
        } catch (e) {
          // do nothing
        }
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          _this.api = (browser.extension as any)[api];
        } catch (e) {
          // do nothing
        }
      }
    });

    if (hasBrowser) {
      try {
        if (browser && browser.runtime) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.runtime = browser.runtime as any;
        }
      } catch (e) {
        // do nothing
      }

      try {
        if (browser && browser.browserAction) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.browserAction = browser.browserAction as any;
        }
      } catch (e) {
        // do nothing
      }
    }
  }
}

export const extension = new Extension();
