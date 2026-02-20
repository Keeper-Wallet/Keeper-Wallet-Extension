import {
  configure,
  setupBrowser,
  type WebdriverIOQueries,
  type WebdriverIOQueriesChainable,
} from '@testing-library/webdriverio';
import type * as mocha from 'mocha';
import { remote } from 'webdriverio';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace WebdriverIO {
    interface Browser extends WebdriverIOQueries, WebdriverIOQueriesChainable {
      openKeeperPopup: () => Promise<void>;
      openKeeperExtensionPage: () => Promise<void>;
    }

    interface Element extends WebdriverIOQueries, WebdriverIOQueriesChainable {}
  }
}

declare module 'webdriverio' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ChainablePromiseElement<T extends WebdriverIO.Element | undefined>
    extends WebdriverIOQueriesChainable {}
}

declare module 'mocha' {
  interface Context {
    nodeUrl: string;
  }
}

export const mochaHooks = () => ({
  async beforeAll(this: mocha.Context) {
    this.nodeUrl = 'http://waves-private-node:6869';

    // Динамический импорт expect-webdriverio для обхода top-level await
    const { expect } = await import('expect-webdriverio');

    Object.defineProperty(global, 'expect', {
      configurable: true,
      value: expect,
    });
    Object.defineProperty(global, 'browser', {
      configurable: true,
      value: await remote({
        logLevel: 'warn',
        hostname: '127.0.0.1',
        port: 4444,
        path: '/wd/hub',
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [
              '--load-extension=/app/dist/chrome',
              '--disable-web-security',
              // Performance optimizations
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding',
              '--disable-features=TranslateUI',
              '--disable-ipc-flooding-protection',
              '--no-first-run',
              '--no-default-browser-check',
            ],
          },
          pageLoadStrategy: 'eager',
        },
        waitforTimeout: 30 * 1000,
        connectionRetryTimeout: 120 * 1000,
        connectionRetryCount: 3,
      }),
    });

    configure({
      asyncUtilTimeout: 30 * 1000,
    });

    setupBrowser(browser);

    global.$ = browser.$.bind(browser);
    global.$ = browser.$.bind(browser);

    // Navigate to chrome://extensions to find the extension ID
    await browser.navigateTo('chrome://extensions');

    // Enable developer mode if not already enabled
    await browser.execute(() => {
      const devModeToggle = document
        .querySelector('extensions-manager')
        ?.shadowRoot?.querySelector('extensions-toolbar')
        ?.shadowRoot?.querySelector('#devMode');
      if (devModeToggle && !(devModeToggle as HTMLInputElement).checked) {
        (devModeToggle as HTMLElement).click();
      }
    });

    await browser.pause(500);

    // Get extension ID from the extensions page
    const keeperExtensionId = await browser.execute(() => {
      const extensionsManager = document.querySelector('extensions-manager');
      const itemsList = extensionsManager?.shadowRoot?.querySelector(
        'extensions-item-list',
      );
      const items = itemsList?.shadowRoot?.querySelectorAll('extensions-item');

      if (!items) return undefined;

      for (const item of Array.from(items)) {
        const nameEl = item.shadowRoot?.querySelector('#name');
        if (nameEl?.textContent?.toLowerCase().includes('keeper wallet')) {
          return item.getAttribute('id');
        }
      }
      return undefined;
    });

    if (!keeperExtensionId) {
      throw new Error('Could not find Keeper Wallet extension id');
    }

    // default clearValue doesn't produce input event for some reason ¯\_(ツ)_/¯
    // https://github.com/webdriverio/webdriverio/issues/5869#issuecomment-964012560
    browser.overwriteCommand(
      'clearValue',
      async function (this: WebdriverIO.Element) {
        // https://w3c.github.io/webdriver/#keyboard-actions
        await this.elementSendKeys(this.elementId, '\uE009a'); // Ctrl+a
        await this.elementSendKeys(this.elementId, '\uE003'); // Backspace
      },
      true,
    );

    browser.addCommand(
      'openKeeperPopup',
      async function (this: WebdriverIO.Browser) {
        await this.navigateTo(
          `chrome-extension://${keeperExtensionId}/popup.html`,
        );
      },
    );

    browser.addCommand(
      'openKeeperExtensionPage',
      async function (this: WebdriverIO.Browser) {
        await this.navigateTo(`chrome://extensions/?id=${keeperExtensionId}`);
      },
    );
  },

  async afterAll(this: mocha.Context) {
    if (typeof browser !== 'undefined') {
      browser.deleteSession();
    }
  },
});
