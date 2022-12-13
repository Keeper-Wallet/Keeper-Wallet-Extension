import { expect } from 'expect-webdriverio';

import { ConfirmDeleteAccountsScreen } from '../pageobject/ConfirmDeleteAccountsScreen';
import { GetStartedScreen } from '../pageobject/GetStartedScreen';
import { HomeScreen } from '../pageobject/HomeScreen';
import { ImportFormScreen } from '../pageobject/ImportFormScreen';
import { ImportSuccessScreen } from '../pageobject/ImportSuccessScreen';
import { ImportUsingSeedScreen } from '../pageobject/ImportUsingSeedScreen';
import { NewAccountScreen } from '../pageobject/NewAccountScreen';
import { NewWalletNameScreen } from '../pageobject/NewWalletNameScreen';
import { OtherAccountsScreen } from '../pageobject/OtherAccountsScreen';
import {
  GeneralSettingsScreen,
  PermissionControlSettingsScreen,
  SettingsScreen,
} from '../pageobject/SettingsScreen';
import { NetworksMenu,TopMenu } from '../pageobject/TopMenu';
import { DEFAULT_PASSWORD } from './constants';

export const App = {
  initVault: async (password = DEFAULT_PASSWORD) => {
    const tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await browser.openKeeperPopup();
    const [tabAccounts] = await waitForNewWindows(1);
    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await GetStartedScreen.getStartedButton.click();
    await NewAccountScreen.passwordInput.setValue(password);
    await NewAccountScreen.passwordConfirmationInput.setValue(password);
    await NewAccountScreen.termsAndConditionsLine.click();
    await NewAccountScreen.privacyPolicyLine.click();
    await NewAccountScreen.continueButton.click();
    expect(await ImportFormScreen.root.isDisplayed()).toBe(true);

    await browser.closeWindow();
    await browser.switchToWindow(tabKeeper);
  },

  resetVault: async () => {
    await browser.openKeeperPopup();

    await TopMenu.settingsButton.click();
    await SettingsScreen.deleteAccountsButton.click();
    await ConfirmDeleteAccountsScreen.confirmPhraseInput.setValue(
      'DELETE ALL ACCOUNTS'
    );
    await ConfirmDeleteAccountsScreen.deleteAllButton.click();

    expect(GetStartedScreen.getStartedButton).toBeDisplayed();
  },

  closeBgTabs: async (foreground: string) => {
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
    await HomeScreen.otherAccountsButton.click();
    await OtherAccountsScreen.addAccountButton.click();
  },

  getActiveAccountName: async () =>
    await HomeScreen.activeAccountNameField.getText(),

  getOtherAccountNames: async () => {
    await $('[data-testid="otherAccountsButton"]').click();
    await $('[data-testid="otherAccountsPage"]').waitForDisplayed();

    const accountNames = await $$(
      '[data-testid="accountCard"] [data-testid="accountName"]'
    ).map(accName => accName.getText());

    await $('div.arrow-back-icon').click();

    return accountNames;
  },
};

export const AccountsHome = {
  importAccount: async (name: string, seed: string) => {
    await ImportFormScreen.importBySeedButton.click();

    await ImportUsingSeedScreen.seedInput.setValue(seed);
    await ImportUsingSeedScreen.importAccountButton.click();

    await NewWalletNameScreen.nameInput.setValue(name);
    await NewWalletNameScreen.continueButton.click();

    await ImportSuccessScreen.addAnotherAccountButton.click();
    await ImportFormScreen.root.waitForDisplayed();
  },
};

export const Settings = {
  setSessionTimeout: async (name: string) => {
    // refresh timeout by focus window
    await browser.execute(() => {
      window.focus();
    });

    await TopMenu.settingsButton.click();
    await SettingsScreen.generalSectionLink.click();
    await GeneralSettingsScreen.setSessionTimeoutByName(name);
  },

  setMinSessionTimeout: async () => {
    await Settings.setSessionTimeout("Browser timeout");
  },

  setMaxSessionTimeout: async () => {
    await Settings.setSessionTimeout("1 hour");
  },

  clearCustomList: async () => {
    await TopMenu.settingsButton.click();
    await SettingsScreen.permissionsSectionLink.click();

    const permissions = await PermissionControlSettingsScreen.permissionItems;
    for (const permission of permissions) {
      await permission.detailsIcon.click();
      await PermissionControlSettingsScreen.modalDeleteButton.click();
    }
  },
};

export const Network = {
  switchTo: async (network: string) => {
    await NetworksMenu.networkMenuButton.click();
    await NetworksMenu.networkByName(network).click();
  },

  checkNetwork: async (network: string) => {
    const networkMenuButton = NetworksMenu.networkMenuButton;
    await networkMenuButton.waitForDisplayed();
    expect(networkMenuButton).toHaveText(network);
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
