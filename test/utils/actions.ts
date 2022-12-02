import { expect } from "expect-webdriverio";

import { Common } from "../pageobject/Common";
import { EmptyHomeScreen } from "../pageobject/EmptyHomeScreen";
import { GetStartedScreen } from "../pageobject/GetStartedScreen";
import { HomeScreen } from "../pageobject/HomeScreen";
import { ImportFormScreen } from "../pageobject/ImportFormScreen";
import { ImportSuccessScreen } from "../pageobject/ImportSuccessScreen";
import { ImportUsingSeedScreen } from "../pageobject/ImportUsingSeedScreen";
import { NewAccountScreen } from "../pageobject/NewAccountScreen";
import { NewWalletNameScreen } from "../pageobject/NewWalletNameScreen";
import { OtherAccountsScreen } from "../pageobject/OtherAccountsScreen";
import { GeneralSettingsScreen, SettingsScreen } from "../pageobject/SettingsScreen";
import { DEFAULT_PASSWORD } from "./constants";

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

    await $("//div[contains(@class, 'settingsIcon@menu')]").click();
    await $("//div[contains(@class, 'deleteAccounts@settings')]").click();
    await $("[data-testid=\"confirmPhrase\"]").setValue("DELETE ALL ACCOUNTS");
    await $("[data-testid=\"resetConfirm\"]").click();

    await $("[data-testid=\"getStartedBtn\"]").waitForExist();
  },

  closeBgTabs: async (foreground: string) => {
    for (const handle of await browser.getWindowHandles()) {
      if (handle !== foreground) {
        await browser.switchToWindow(handle);
        await browser.closeWindow();
      }
    }

    await browser.switchToWindow(foreground);
  }
};

export const PopupHome = {
  addAccount: async () => {
    await HomeScreen.otherAccountsButton.click();
    await OtherAccountsScreen.addAccountButton.click();
  },

  getActiveAccountName: async () =>
    await browser.findByTestId$("activeAccountCard").findByTestId$("accountName").getText(),

  getOtherAccountNames: async () => {
    await $("[data-testid=\"otherAccountsButton\"]").click();
    await $("[data-testid=\"otherAccountsPage\"]").waitForDisplayed();

    const accountNames = await $$(
      "[data-testid=\"accountCard\"] [data-testid=\"accountName\"]"
    ).map(accName => accName.getText());

    await $("div.arrow-back-icon").click();

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
  }
};

export const Settings = {
  setSessionTimeout: async (index: number) => {
    // refresh timeout by focus window
    await browser.execute(() => {
      window.focus();
    });

    await EmptyHomeScreen.settingsButton.click();
    await SettingsScreen.generalSectionLink.click();
    await GeneralSettingsScreen.setSessionTimeoutByIndex(index);
  },

  setMinSessionTimeout: async () => {
    await Settings.setSessionTimeout(1);
  },

  setMaxSessionTimeout: async () => {
    await Settings.setSessionTimeout(-1);
  },

  clearCustomList: async () => {
    await $("//div[contains(@class, 'settingsIcon@menu')]").click();
    await $("#settingsPermission").click();

    for (const originEl of await $$(
      "//div[contains(@class, 'permissionItem@list')]"
    )) {
      await originEl.$("//button[contains(@class, 'settings@list')]").click();
      await $("#delete").click();
    }
  }
};

export const Network = {
  switchTo: async (network: string) => {
    await Common.networkMenuButton.click();
    const networksMenu = await Common.getNetworksMenu();
    (await networksMenu.networkByName(network)).click();
  },

  checkNetwork: async (network: string) => {
    const networkMenuButton = Common.networkMenuButton;
    await networkMenuButton.waitForDisplayed();
    expect(networkMenuButton).toHaveText(network);
  },

  switchToAndCheck: async (network: string) => {
    await Network.switchTo(network);
    await Network.checkNetwork(network);
  }
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
            timeoutMsg: "waiting for new windows to appear"
          }
        );

        return newHandles;
      }
    };
  },

  waitForWindowToClose: async (handle: string) => {
    await browser.waitUntil(
      async () => {
        const handles = await browser.getWindowHandles();

        return !handles.includes(handle);
      },
      {
        timeoutMsg: "waiting for window to close"
      }
    );
  }
};
