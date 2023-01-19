import { ConfirmDeleteAccountsScreen } from '../helpers/ConfirmDeleteAccountsScreen';
import { GetStartedScreen } from '../helpers/GetStartedScreen';
import { HomeScreen } from '../helpers/HomeScreen';
import { ImportFormScreen } from '../helpers/ImportFormScreen';
import { ImportSuccessScreen } from '../helpers/ImportSuccessScreen';
import { ImportViaSeedScreen } from '../helpers/ImportViaSeedScreen';
import { NetworksMenu } from '../helpers/NetworksMenu';
import { NewAccountScreen } from '../helpers/NewAccountScreen';
import { NewWalletNameScreen } from '../helpers/NewWalletNameScreen';
import { OtherAccountsScreen } from '../helpers/OtherAccountsScreen';
import { GeneralSettingsScreen } from '../helpers/settings/GeneralSettingsScreen';
import { PermissionControlSettingsScreen } from '../helpers/settings/PermissionControlSettingsScreen';
import { SettingsMenuScreen } from '../helpers/settings/SettingsMenuScreen';
import { TopMenu } from '../helpers/TopMenu';
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
    await SettingsMenuScreen.deleteAccountsButton.click();
    await ConfirmDeleteAccountsScreen.confirmPhraseInput.setValue(
      'DELETE ALL ACCOUNTS'
    );
    await ConfirmDeleteAccountsScreen.deleteAllButton.click();

    expect(await GetStartedScreen.getStartedButton).toBeDisplayed();
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

  getActiveAccountName: async () => {
    const accountName = HomeScreen.activeAccountName;
    await accountName.waitForDisplayed();
    return await accountName.getText();
  },
};

export const AccountsHome = {
  importAccount: async (name: string, seed: string) => {
    await ImportFormScreen.importViaSeedButton.click();

    await ImportViaSeedScreen.seedInput.setValue(seed);
    await ImportViaSeedScreen.importAccountButton.click();

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
    await SettingsMenuScreen.generalSectionLink.click();
    await GeneralSettingsScreen.setSessionTimeoutByName(name);
  },

  setMinSessionTimeout: async () => {
    await Settings.setSessionTimeout('Browser timeout');
  },

  clearCustomList: async () => {
    await TopMenu.settingsButton.click();
    await SettingsMenuScreen.permissionsSectionLink.click();

    const permissions = await PermissionControlSettingsScreen.permissionItems;
    for (const permission of permissions) {
      await permission.detailsIcon.click();
      await PermissionControlSettingsScreen.modalDeleteButton.click();
    }
  },
};

export const Network = {
  switchTo: async (network: string) => {
    const currentNetwork = await NetworksMenu.networkMenuButton.getText();
    if (currentNetwork === network) return;
    await NetworksMenu.networkMenuButton.click();
    await browser.pause(100);
    const networkLink = await NetworksMenu.networkByName(network);
    await networkLink.waitForDisplayed();
    await networkLink.click();
  },

  checkNetwork: async (network: string) => {
    const networkMenuButton = NetworksMenu.networkMenuButton;
    await networkMenuButton.waitForDisplayed();
    expect(await networkMenuButton).toHaveText(network);
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

export const ContentScript = {
  waitForKeeperWallet() {
    return browser.executeAsync((done: () => void) => {
      (function poll() {
        if (typeof KeeperWallet !== 'undefined') done();
        else setTimeout(() => poll(), 100);
      })();
    });
  },
};
