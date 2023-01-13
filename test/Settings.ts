import { expect } from 'expect-webdriverio';

import { ChooseAccountsForm } from './helpers/ChooseAccountsForm';
import { ConfirmDeleteAccountsScreen } from './helpers/ConfirmDeleteAccountsScreen';
import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { LoginScreen } from './helpers/LoginScreen';
import {
  ExportAndImportSettingsScreen,
  NetworkSettingsScreen,
  PermissionControlSettingsScreen,
  SettingsScreen,
} from './helpers/SettingsScreen';
import { TopMenu } from './helpers/TopMenu';
import { AuthTransactionScreen } from './helpers/transactions/AuthTransactionScreen';
import { CommonTransaction } from './helpers/transactions/CommonTransaction';
import { FinalTransactionScreen } from './helpers/transactions/FinalTransactionScreen';
import { AccountsHome, App, Settings, Windows } from './utils/actions';
import {
  CUSTOMLIST,
  DEFAULT_ANIMATION_DELAY,
  DEFAULT_PASSWORD,
  WHITELIST,
} from './utils/constants';

const SPENDING_LIMIT = '1';
const BROWSER_TIMEOUT_DELAY = 120 * 1000;

describe('Settings', function () {
  let tabKeeper: string;

  async function performLogin(password: string) {
    await LoginScreen.passwordInput.setValue(password);
    await LoginScreen.enterButton.click();
  }

  before(async function () {
    await App.initVault();
    await Settings.setMaxSessionTimeout();
    await browser.openKeeperPopup();
    tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
    const [tabAccounts] = await waitForNewWindows(1);

    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await AccountsHome.importAccount(
      'rich',
      'waves private node seed with waves tokens'
    );
    await AccountsHome.importAccount(
      'test',
      'side angry perfect sight capital absurd stuff pulp climb jealous onion address speed portion category'
    );
    await AccountsHome.importAccount(
      'test3',
      'defy credit shoe expect pair gun future slender escape visa test book tone patient vibrant'
    );
    await browser.closeWindow();
    await browser.switchToWindow(tabKeeper);

    await TopMenu.settingsButton.click();
  });

  after(async function () {
    await App.closeBgTabs(tabKeeper);
  });

  describe('Export accounts', function () {
    it('creates an encrypted keystore file containing account details', async function () {
      await SettingsScreen.exportAndImportSectionLink.click();

      await ExportAndImportSettingsScreen.exportAccountsLink.click();
      (
        await ChooseAccountsForm.getAccountByAddress(
          '3P5Xx9MFs8VchRjfLeocGFxXkZGknm38oq1'
        )
      ).checkbox.click();
      await ChooseAccountsForm.exportButton.click();
      await ChooseAccountsForm.modalPasswordInput.setValue(DEFAULT_PASSWORD);
      await ChooseAccountsForm.modalEnterButton.click();
    });
  });

  describe('Network', function () {
    let nodeUrl: string, matcherUrl: string;

    before(async function () {
      await SettingsScreen.networkSectionLink.click();
      nodeUrl = await NetworkSettingsScreen.nodeAddress.getValue();
      matcherUrl = await NetworkSettingsScreen.matcherAddress.getValue();
    });

    after(async function () {
      await TopMenu.backButton.click();
    });

    describe('Node URL', function () {
      it('Is shown', async function () {
        expect(NetworkSettingsScreen.nodeAddress).toBeDisplayed();
      });
      it('Can be changed', async function () {
        await NetworkSettingsScreen.nodeAddress.clearValue();
        expect(NetworkSettingsScreen.nodeAddress).not.toHaveValue(nodeUrl);
      });
      it('Can be copied');
    });

    describe('Matcher URL', function () {
      it('Is shown', async function () {
        expect(NetworkSettingsScreen.matcherAddress).toBeDisplayed();
      });
      it('Can be changed', async function () {
        await NetworkSettingsScreen.matcherAddress.clearValue();
        expect(NetworkSettingsScreen.matcherAddress).not.toHaveValue(
          matcherUrl
        );
      });
      it('Can be copied');
    });

    describe('Set default', function () {
      it('Resets Node and Matcher URLs', async function () {
        await NetworkSettingsScreen.setDefaultButton.click();
        expect(NetworkSettingsScreen.nodeAddress).toHaveValue(nodeUrl);
        expect(NetworkSettingsScreen.matcherAddress).toHaveValue(matcherUrl);
      });
    });
  });

  describe('Permissions control', function () {
    before(async function () {
      await SettingsScreen.permissionsSectionLink.click();
    });

    after(async function () {
      await TopMenu.backButton.click();
    });

    const checkChangingAutoLimitsInResourceSettings = () => {
      describe('Changing auto-limits in resource settings', function () {
        beforeEach(async function () {
          (
            await PermissionControlSettingsScreen.permissionItems
          )[0].detailsIcon.click();
          await browser.pause(DEFAULT_ANIMATION_DELAY);
        });

        it('Enabling', async function () {
          await PermissionControlSettingsScreen.modalSetResolutionTime(
            'For 1 hour'
          );
          await browser.pause(DEFAULT_ANIMATION_DELAY);
          await PermissionControlSettingsScreen.modalSpendingLimitInput.setValue(
            SPENDING_LIMIT
          );
          await PermissionControlSettingsScreen.modalSaveButton.click();
          expect(
            (await PermissionControlSettingsScreen.permissionItems)[0].status
          ).toHaveText('Approved+ Automatic signing');
        });

        it('Disabling', async function () {
          await PermissionControlSettingsScreen.modalSetResolutionTime(
            "Don't automatically sign"
          );
          await PermissionControlSettingsScreen.modalSaveButton.click();
          expect(
            (await PermissionControlSettingsScreen.permissionItems)[0].status
          ).toHaveText('Approved');
        });
      });
    };

    describe('White list', function () {
      before(async function () {
        await PermissionControlSettingsScreen.whiteListLink.click();
      });

      it('Default whitelisted services appears', async function () {
        for (const origin of WHITELIST) {
          expect(
            (
              await PermissionControlSettingsScreen.getPermissionByOrigin(
                origin
              )
            ).root
          ).toBeDisplayed();
        }
      });

      checkChangingAutoLimitsInResourceSettings();

      describe('Verification of transactions with auto-limits', function () {
        it('Transfer');
        it('MassTransfer');
        it('Data');
        it('InvokeScript');
      });
    });

    describe('Custom list', function () {
      async function publicStateFromOrigin(origin: string) {
        // this requests permission first
        const permissionRequest = () => {
          window.result = KeeperWallet.publicState();
        };

        await browser.navigateTo(`https://${origin}`);
        await browser.execute(permissionRequest);
      }

      after(async () => {
        await browser.openKeeperPopup();
        await Settings.clearCustomList();
      });

      describe('Adding', function () {
        it('Origin added to custom list', async function () {
          const origin = CUSTOMLIST[0];

          const { waitForNewWindows } = await Windows.captureNewWindows();
          await publicStateFromOrigin(origin);
          const [messageWindow] = await waitForNewWindows(1);
          await browser.switchToWindow(messageWindow);
          await browser.refresh();

          await AuthTransactionScreen.authButton.click();
          expect(FinalTransactionScreen.root).toBeDisplayed();
          await FinalTransactionScreen.closeButton.click();
          await Windows.waitForWindowToClose(messageWindow);
          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();

          await TopMenu.settingsButton.click();
          await SettingsScreen.permissionsSectionLink.click();

          expect(
            (
              await PermissionControlSettingsScreen.getPermissionByOrigin(
                CUSTOMLIST[0]
              )
            ).root
          ).toBeDisplayed();
        });

        it('Origin added to custom list with auto-limits', async function () {
          const origin = CUSTOMLIST[1];

          const { waitForNewWindows } = await Windows.captureNewWindows();
          await publicStateFromOrigin(origin);
          const [messageWindow] = await waitForNewWindows(1);
          await browser.switchToWindow(messageWindow);
          await browser.refresh();

          await AuthTransactionScreen.permissionDetailsButton.click();
          await AuthTransactionScreen.setResolutionTime('For 1 hour');
          await AuthTransactionScreen.spendingLimitInput.setValue(
            SPENDING_LIMIT
          );
          await AuthTransactionScreen.authButton.click();

          await FinalTransactionScreen.closeButton.click();
          await Windows.waitForWindowToClose(messageWindow);
          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();

          await TopMenu.settingsButton.click();
          await SettingsScreen.permissionsSectionLink.click();

          expect(
            (
              await PermissionControlSettingsScreen.getPermissionByOrigin(
                origin
              )
            ).status
          ).toHaveText('Approved+ Automatic signing');
        });
      });

      describe('Blocking', function () {
        after(async function () {
          await browser.openKeeperPopup();

          await TopMenu.settingsButton.click();
          await SettingsScreen.permissionsSectionLink.click();
        });

        it('Block all messages from origin in custom list', async function () {
          const firstOrigin = (
            await PermissionControlSettingsScreen.permissionItems
          )[0];
          const origin = await firstOrigin.origin.getText();
          await firstOrigin.enableCheckbox.click();
          await publicStateFromOrigin(origin);
          const response = await browser.executeAsync(
            (done: (result: unknown) => void) => {
              (window.result as Promise<unknown>).then(done, done);
            }
          );
          expect(response).toStrictEqual({
            message: 'Api rejected by user',
            code: '12',
            data: null,
          });
        });
      });

      describe('Removing', function () {
        after(async function () {
          await browser.openKeeperPopup();

          await TopMenu.settingsButton.click();
          await SettingsScreen.permissionsSectionLink.click();
        });

        it('After deletion, requests generate permission request', async function () {
          const originToDelete =
            await PermissionControlSettingsScreen.getPermissionByOrigin(
              'waves.tech'
            );
          const origin = await originToDelete.origin.getText();
          await originToDelete.detailsIcon.click();
          await PermissionControlSettingsScreen.modalDeleteButton.click();
          const { waitForNewWindows } = await Windows.captureNewWindows();
          await publicStateFromOrigin(origin);
          const [messageWindow] = await waitForNewWindows(1);
          await browser.switchToWindow(messageWindow);
          await browser.refresh();

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();

          await Windows.waitForWindowToClose(messageWindow);
          await browser.switchToWindow(tabKeeper);
        });
      });

      checkChangingAutoLimitsInResourceSettings();

      describe('Verification of transactions with auto-limits', function () {
        it('Transfer');
        it('MassTransfer');
        it('Data');
        it('InvokeScript');
      });
    });
  });

  describe('General', function () {
    before(async function () {
      await SettingsScreen.generalSectionLink.click();
    });

    after(async function () {
      await TopMenu.backButton.click();
    });

    describe('Session Timeout', function () {
      afterEach(async function () {
        await performLogin(DEFAULT_PASSWORD);
      });

      it('Logout after "Browser timeout"', async function () {
        await browser.openKeeperPopup();
        await Settings.setMinSessionTimeout();

        await browser.pause(BROWSER_TIMEOUT_DELAY);
        expect(LoginScreen.root).toBeDisplayed();
      });

      it('Logout after 5 min / 10 min / 1 hour');
    });
  });

  describe('Root', function () {
    describe('Auto-click protection', function () {
      before(async function () {
        expect(SettingsScreen.root).toBeDisplayed();
      });

      it('Can be enabled', async function () {
        await SettingsScreen.clickProtectionButton.click();
        expect(SettingsScreen.clickProtectionButton).toHaveAttr(
          'data-teston',
          'true'
        );
        expect(SettingsScreen.clickProtectionStatus).toHaveText('Enabled');
      });

      it('Can be disabled', async function () {
        await SettingsScreen.clickProtectionButton.click();
        expect(SettingsScreen.clickProtectionButton).toHaveAttr(
          'data-teston',
          'false'
        );
        expect(SettingsScreen.clickProtectionStatus).toHaveText('Disabled');
      });

      it('Display tooltip', async function () {
        await SettingsScreen.clickProtectionIcon.moveTo();
        expect(SettingsScreen.helpTooltip).toHaveText(
          'Protect yourself from Clicker Trojans threats'
        );
      });
    });

    describe('Suspicious assets protection', function () {
      before(async function () {
        expect(SettingsScreen.root).toBeDisplayed();
      });

      it('Can be disabled', async function () {
        await SettingsScreen.suspiciousAssetsProtectionButton.click();
        expect(SettingsScreen.suspiciousAssetsProtectionButton).toHaveAttr(
          'data-teston',
          'true'
        );
        expect(SettingsScreen.suspiciousAssetsProtectionStatus).toHaveText(
          'Enable'
        );
      });

      it('Can be enabled', async function () {
        await SettingsScreen.suspiciousAssetsProtectionButton.click();
        expect(SettingsScreen.suspiciousAssetsProtectionButton).toHaveAttr(
          'data-teston',
          'false'
        );
        expect(SettingsScreen.suspiciousAssetsProtectionStatus).toHaveText(
          'Disabled'
        );
      });

      it('Display tooltip', async function () {
        await SettingsScreen.suspiciousAssetsProtectionIcon.moveTo();
        expect(SettingsScreen.helpTooltip).toHaveText(
          "Don't show balances and transactions related to suspicious assets"
        );
      });
    });

    describe('Logout', function () {
      after(async function () {
        await performLogin(DEFAULT_PASSWORD);
        await TopMenu.settingsButton.click();
      });

      it('Exit to the login screen', async function () {
        await SettingsScreen.logoutButton.click();
        expect(LoginScreen.root).toBeDisplayed();
      });
    });

    describe('Delete accounts', function () {
      it('Account deletion warning displays', async function () {
        await SettingsScreen.deleteAccountsButton.click();
        expect(ConfirmDeleteAccountsScreen.root).toBeDisplayed();
      });

      it('Clicking "Back" button cancels the deletion', async function () {
        await TopMenu.backButton.click();
        expect(SettingsScreen.root).toBeDisplayed();
      });

      it('Clicking "Cancel" button cancels the deletion', async function () {
        await SettingsScreen.deleteAccountsButton.click();
        await ConfirmDeleteAccountsScreen.cancelButton.click();
        expect(SettingsScreen.root).toBeDisplayed();
      });

      it('"Delete all" button is disabled', async function () {
        await SettingsScreen.deleteAccountsButton.click();
        expect(ConfirmDeleteAccountsScreen.deleteAllButton).toBeDisabled();
      });

      it('Wrong confirmation phrase displays error', async function () {
        await ConfirmDeleteAccountsScreen.confirmPhraseInput.setValue(
          'delete all accounts'
        );
        expect(ConfirmDeleteAccountsScreen.deleteAllButton).toBeDisabled();
        expect(ConfirmDeleteAccountsScreen.confirmPhraseError).toHaveText(
          'The phrase is entered incorrectly'
        );
      });

      it('Correct confirmation phrase enables "Delete all" button', async function () {
        await ConfirmDeleteAccountsScreen.confirmPhraseInput.setValue(
          'DELETE ALL ACCOUNTS'
        );
        expect(ConfirmDeleteAccountsScreen.deleteAllButton).toBeEnabled();
      });

      it('Clicking "Delete account" removes all accounts from current network', async function () {
        await ConfirmDeleteAccountsScreen.deleteAllButton.click();
        await browser.pause(1000);
        expect(await LoginScreen.root).toBeDisplayed();
      });
    });
  });
});
