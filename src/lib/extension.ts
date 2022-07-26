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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Extension(this: any) {
  const _this = this;

  apis.forEach(function (api) {
    _this[api] = null;

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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const extension = new Extension();
