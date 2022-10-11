import { expect } from 'chai';
import * as mocha from 'mocha';

import { DEFAULT_PASSWORD, DEFAULT_SWITCH_NETWORK_DELAY } from './constants';

export const App = {
  async initVault(this: mocha.Context, password: string = DEFAULT_PASSWORD) {
    const tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await App.open.call(this);
    const [tabAccounts] = await waitForNewWindows(1);
    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await $('[data-testid="getStartedBtn"]').click();

    await $('[data-testid="newAccountForm"]').waitForDisplayed();
    await $('#first').setValue(password);
    await $('#second').setValue(password);
    await $('#termsAccepted').click();
    await $('#conditionsAccepted').click();
    await $('button[type=submit]').click();

    await $('[data-testid="importForm"]').waitForDisplayed();

    await browser.closeWindow();
    await browser.switchToWindow(tabKeeper);
  },

  async resetVault(this: mocha.Context) {
    await App.open.call(this);

    await $("//div[contains(@class, 'settingsIcon@menu')]").click();
    await $("//div[contains(@class, 'deleteAccounts@settings')]").click();
    await $('[data-testid="confirmPhrase"]').setValue('DELETE ALL ACCOUNTS');
    await $('[data-testid="resetConfirm"]').click();
  },

  async open(this: mocha.Context) {
    await browser.navigateTo(this.extensionUrl);
  },

  async closeBgTabs(this: mocha.Context, foreground: string) {
    for (const handle of await browser.getWindowHandles()) {
      if (handle !== foreground) {
        await browser.switchToWindow(handle);
        await browser.closeWindow();
      }
    }

    await browser.switchToWindow(foreground);
  },
};

export const PopupHome = {
  addAccount: async () => {
    await $('[data-testid="otherAccountsButton"]').click();
    await $('[data-testid="addAccountButton"]').click();
  },

  getActiveAccountName: async () =>
    $(
      '[data-testid="activeAccountCard"] [data-testid="accountName"]'
    ).getText(),

  getOtherAccountNames: async () => {
    await $('[data-testid="otherAccountsButton"]').click();

    const accountNames = await $$(
      '[data-testid="accountCard"] [data-testid="accountName"]'
    ).map(accName => accName.getText());

    await $('div.arrow-back-icon').click();

    return accountNames;
  },

  getAllAccountNames: async () => [
    await PopupHome.getActiveAccountName(),
    ...(await PopupHome.getOtherAccountNames()),
  ],
};

export const AccountsHome = {
  importAccount: async (name: string, seed: string) => {
    await $('[data-testid="importSeed"]').click();

    await $('[data-testid="seedInput"]').setValue(seed);
    await $('[data-testid="continueBtn"]').click();

    await $('[data-testid="newAccountNameInput"]').setValue(name);
    await $('[data-testid="continueBtn"]').click();

    await $('[data-testid="addAnotherAccountBtn"]').click();
    await $('[data-testid="importForm"]').waitForDisplayed();
  },
};

export const Settings = {
  setSessionTimeout: async (index: number) => {
    // refresh timeout by focus window
    await browser.execute(() => {
      window.focus();
    });

    await $("//div[contains(@class, 'settingsIcon@menu')]").click();
    await $('button#settingsGeneral').click();
    await $("//div[contains(@class, 'trigger@Select-module')]").click();

    const position = index === -1 ? 'last()' : `position()=${index}`;

    await $(
      `//div[contains(@class, 'item@Select-module')][${position}]`
    ).click();
  },

  setMinSessionTimeout: async () => {
    await Settings.setSessionTimeout(1);
  },

  setMaxSessionTimeout: async () => {
    await Settings.setSessionTimeout(-1);
  },

  clearCustomList: async () => {
    await $("//div[contains(@class, 'settingsIcon@menu')]").click();
    await $('#settingsPermission').click();

    for (const originEl of await $$(
      "//div[contains(@class, 'permissionItem@list')]"
    )) {
      await originEl.$("//button[contains(@class, 'settings@list')]").click();
      await $('#delete').click();
    }
  },
};

export const Network = {
  switchTo: async (network: string) => {
    await browser.pause(DEFAULT_SWITCH_NETWORK_DELAY);

    const networkMenuBtn = await $(
      "//div[contains(@class, 'network@network')]//div[contains(@class, 'basic500 flex')]"
    );
    await networkMenuBtn.waitForExist();
    await networkMenuBtn.waitForDisplayed();
    await networkMenuBtn.click();

    const networkMenu = await $("//div[contains(@class, 'isShow@network')]");
    await networkMenu.waitForExist();
    await networkMenu.waitForDisplayed();

    const networkMenuItem = await networkMenu.$(
      `//div[contains(@class, 'chooseNetwork@network')][contains(text(), '${network}')]`
    );
    await networkMenuItem.waitForExist();
    await networkMenuItem.waitForDisplayed();
    await networkMenuItem.click();
  },

  checkNetwork: async (network: string) => {
    await $(
      "//div[contains(@class, 'root@loadingScreen-module')]"
    ).waitForExist();

    await $(
      '[data-testid="importForm"], [data-testid="assetsForm"]'
    ).waitForExist();

    expect(
      await $(
        "//div[contains(@class, 'network@network')]//span[contains(@class, 'networkBottom@network')]"
      ).getText()
    ).matches(new RegExp(network, 'i'));
  },

  switchToAndCheck: async (network: string) => {
    await Network.switchTo(network);
    await Network.checkNetwork(network);
  },
};

export const Windows = {
  captureNewWindows: async () => {
    const prevHandlesSet = new Set(await browser.getWindowHandles());

    return {
      waitForNewWindows: async (count: number) => {
        let newHandles: string[] = [];

        await browser.waitUntil(
          async () => {
            const handles = await browser.getWindowHandles();

            newHandles = handles.filter(handle => !prevHandlesSet.has(handle));

            return newHandles.length >= count;
          },
          {
            timeoutMsg: 'waiting for new windows to appear',
          }
        );

        return newHandles;
      },
    };
  },

  waitForWindowToClose: async (handle: string) => {
    await browser.waitUntil(
      async () => {
        const handles = await browser.getWindowHandles();

        return !handles.includes(handle);
      },
      {
        timeoutMsg: 'waiting for window to close',
      }
    );
  },
};
