import waitForExpect from 'wait-for-expect';

import { ChooseAccountsForm } from './helpers/ChooseAccountsForm';
import { ConfirmDeleteAccountsScreen } from './helpers/ConfirmDeleteAccountsScreen';
import { ContentScript } from './helpers/ContentScript';
import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { Settings } from './helpers/flows/Settings';
import { GetStartedScreen } from './helpers/GetStartedScreen';
import { LoginScreen } from './helpers/LoginScreen';
import { AuthMessageScreen } from './helpers/messages/AuthMessageScreen';
import { CommonTransaction } from './helpers/messages/CommonTransaction';
import { FinalTransactionScreen } from './helpers/messages/FinalTransactionScreen';
import { ExportAndImportSettingsScreen } from './helpers/settings/ExportAndImportSettingsScreen';
import { NetworkSettingsScreen } from './helpers/settings/NetworkSettingsScreen';
import { PermissionControlSettingsScreen } from './helpers/settings/PermissionControlSettingsScreen';
import { SettingsMenuScreen } from './helpers/settings/SettingsMenuScreen';
import { TopMenu } from './helpers/TopMenu';
import { Windows } from './helpers/Windows';
import { CUSTOMLIST, DEFAULT_PASSWORD, WHITELIST } from './utils/constants';

const SPENDING_LIMIT = '1';

describe('Settings', function () {
  let tabKeeper: string;

  async function performLogin(password: string) {
    await LoginScreen.passwordInput.setValue(password);
    await LoginScreen.enterButton.click();
  }

  before(async function () {
    await App.initVault();
    tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
    const [tabAccounts] = await waitForNewWindows(1);

    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await AccountsHome.importAccount(
      'rich',
      'waves private node seed with waves tokens',
    );
    await AccountsHome.importAccount(
      'test',
      'side angry perfect sight capital absurd stuff pulp climb jealous onion address speed portion category',
    );
    await AccountsHome.importAccount(
      'test3',
      'defy credit shoe expect pair gun future slender escape visa test book tone patient vibrant',
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
      await SettingsMenuScreen.exportAndImportSectionLink.click();

      await ExportAndImportSettingsScreen.exportAccountsLink.click();
      (
        await ChooseAccountsForm.getAccountByAddress(
          '3P5Xx9MFs8VchRjfLeocGFxXkZGknm38oq1',
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
      await SettingsMenuScreen.networkSectionLink.click();
      nodeUrl = await NetworkSettingsScreen.nodeAddress.getValue();
      matcherUrl = await NetworkSettingsScreen.matcherAddress.getValue();
    });

    after(async function () {
      await TopMenu.backButton.click();
    });

    describe('Node URL', function () {
      it('Is shown', async function () {
        await expect(NetworkSettingsScreen.nodeAddress).toBeDisplayed();
      });
      it('Can be changed', async function () {
        await NetworkSettingsScreen.nodeAddress.clearValue();
        await expect(NetworkSettingsScreen.nodeAddress).not.toHaveValue(
          nodeUrl,
        );
      });
      it('Can be copied');
    });

    describe('Matcher URL', function () {
      it('Is shown', async function () {
        await expect(NetworkSettingsScreen.matcherAddress).toBeDisplayed();
      });
      it('Can be changed', async function () {
        await NetworkSettingsScreen.matcherAddress.clearValue();
        expect(NetworkSettingsScreen.matcherAddress).not.toHaveValue(
          matcherUrl,
        );
      });
      it('Can be copied');
    });

    describe('Set default', function () {
      it('Resets Node and Matcher URLs', async function () {
        await NetworkSettingsScreen.setDefaultButton.click();
        expect(await NetworkSettingsScreen.nodeAddress).toHaveValue(nodeUrl);
        expect(await NetworkSettingsScreen.matcherAddress).toHaveValue(
          matcherUrl,
        );
      });
    });
  });

  describe('Permissions control', function () {
    before(async function () {
      await SettingsMenuScreen.permissionsSectionLink.click();
    });

    after(async function () {
      await TopMenu.backButton.click();
    });

    const checkChangingAutoLimitsInResourceSettings = () => {
      describe('Changing auto-limits in resource settings', function () {
        beforeEach(async function () {
          await (
            await PermissionControlSettingsScreen.permissionItems
          )[0].detailsIcon.click();
          await PermissionControlSettingsScreen.permissionDetailsModal.root.waitForDisplayed();
        });

        it('Enabling', async function () {
          await PermissionControlSettingsScreen.permissionDetailsModal.setResolutionTime(
            'For 1 hour',
          );
          await PermissionControlSettingsScreen.permissionDetailsModal.spendingLimitInput.setValue(
            SPENDING_LIMIT,
          );
          await PermissionControlSettingsScreen.permissionDetailsModal.saveButton.click();
          await expect(
            (await PermissionControlSettingsScreen.permissionItems)[0].status,
          ).toHaveText('Approved+ Automatic signing');
        });

        it('Disabling', async function () {
          await PermissionControlSettingsScreen.permissionDetailsModal.setResolutionTime(
            "Don't automatically sign",
          );
          await PermissionControlSettingsScreen.permissionDetailsModal.saveButton.click();
          await expect(
            (await PermissionControlSettingsScreen.permissionItems)[0].status,
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
                origin,
              )
            ).root,
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
        await ContentScript.waitForKeeperWallet();
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

          await AuthMessageScreen.authButton.click();
          await expect(FinalTransactionScreen.root).toBeDisplayed();
          await FinalTransactionScreen.closeButton.click();
          await Windows.waitForWindowToClose(messageWindow);
          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();

          await TopMenu.settingsButton.click();
          await SettingsMenuScreen.permissionsSectionLink.click();

          expect(
            (
              await PermissionControlSettingsScreen.getPermissionByOrigin(
                CUSTOMLIST[0],
              )
            ).root,
          ).toBeDisplayed();
        });

        it('Origin added to custom list with auto-limits', async function () {
          const origin = CUSTOMLIST[1];

          const { waitForNewWindows } = await Windows.captureNewWindows();
          await publicStateFromOrigin(origin);
          const [messageWindow] = await waitForNewWindows(1);
          await browser.switchToWindow(messageWindow);
          await browser.refresh();

          await AuthMessageScreen.permissionDetailsButton.click();
          await AuthMessageScreen.setResolutionTime('For 1 hour');
          await AuthMessageScreen.spendingLimitInput.setValue(SPENDING_LIMIT);
          await AuthMessageScreen.authButton.click();

          await FinalTransactionScreen.closeButton.click();
          await Windows.waitForWindowToClose(messageWindow);
          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();

          await TopMenu.settingsButton.click();
          await SettingsMenuScreen.permissionsSectionLink.click();

          await expect(
            (
              await PermissionControlSettingsScreen.getPermissionByOrigin(
                origin,
              )
            ).status,
          ).toHaveText('Approved+ Automatic signing');
        });
      });

      describe('Blocking', function () {
        after(async function () {
          await browser.openKeeperPopup();

          await TopMenu.settingsButton.click();
          await SettingsMenuScreen.permissionsSectionLink.click();
        });

        it('Block all messages from origin in custom list', async function () {
          const firstOrigin = (
            await PermissionControlSettingsScreen.permissionItems
          )[1];
          const origin = await firstOrigin.origin.getText();
          await firstOrigin.enableCheckbox.click();
          await publicStateFromOrigin(origin);
          const response = await browser.executeAsync(
            (done: (result: unknown) => void) => {
              (window.result as Promise<unknown>).then(done, done);
            },
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
          await SettingsMenuScreen.permissionsSectionLink.click();
        });

        it('After deletion, requests generate permission request', async function () {
          const originToDelete =
            await PermissionControlSettingsScreen.getPermissionByOrigin(
              'waves.tech',
            );
          const origin = await originToDelete.origin.getText();
          await originToDelete.detailsIcon.click();
          await PermissionControlSettingsScreen.permissionDetailsModal.deleteButton.click();
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
      await SettingsMenuScreen.generalSectionLink.click();
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
        await Settings.setSessionTimeout('Browser timeout');

        await waitForExpect(async () => {
          await expect(LoginScreen.root).toBeDisplayed();
        }, 120 * 1000);
      });
    });
  });

  describe('Root', function () {
    describe('Auto-click protection', function () {
      before(async function () {
        await expect(SettingsMenuScreen.root).toBeDisplayed();
      });

      it('Can be enabled', async function () {
        await SettingsMenuScreen.clickProtectionButton.click();
        await expect(SettingsMenuScreen.clickProtectionButton).toHaveAttr(
          'data-teston',
          'true',
        );
        await expect(SettingsMenuScreen.clickProtectionStatus).toHaveText(
          'Enabled',
        );
      });

      it('Can be disabled', async function () {
        await SettingsMenuScreen.clickProtectionButton.click();
        await expect(SettingsMenuScreen.clickProtectionButton).toHaveAttr(
          'data-teston',
          'false',
        );
        await expect(SettingsMenuScreen.clickProtectionStatus).toHaveText(
          'Disabled',
        );
      });

      it('Display tooltip', async function () {
        await SettingsMenuScreen.clickProtectionIcon.moveTo();
        await expect(SettingsMenuScreen.helpTooltip).toHaveText(
          'Protect yourself from Clicker Trojans threats',
        );
      });
    });

    describe('Suspicious assets protection', function () {
      before(async function () {
        await expect(SettingsMenuScreen.root).toBeDisplayed();
      });

      it('Can be disabled', async function () {
        await SettingsMenuScreen.suspiciousAssetsProtectionButton.click();
        expect(
          await SettingsMenuScreen.suspiciousAssetsProtectionButton,
        ).toHaveAttr('data-teston', 'false');
        await expect(
          SettingsMenuScreen.suspiciousAssetsProtectionStatus,
        ).toHaveText('Disabled');
      });

      it('Can be enabled', async function () {
        await SettingsMenuScreen.suspiciousAssetsProtectionButton.click();
        await expect(
          SettingsMenuScreen.suspiciousAssetsProtectionButton,
        ).toHaveAttr('data-teston', 'true');
        await expect(
          SettingsMenuScreen.suspiciousAssetsProtectionStatus,
        ).toHaveText('Enabled');
      });

      it('Display tooltip', async function () {
        await SettingsMenuScreen.suspiciousAssetsProtectionIcon.moveTo();
        await expect(SettingsMenuScreen.helpTooltip).toHaveText(
          "Don't show balances and transactions related to suspicious assets",
        );
      });
    });

    describe('Logout', function () {
      after(async function () {
        await performLogin(DEFAULT_PASSWORD);
        await TopMenu.settingsButton.click();
      });

      it('Exit to the login screen', async function () {
        await SettingsMenuScreen.logoutButton.click();
        await expect(LoginScreen.root).toBeDisplayed();
      });
    });

    describe('Delete accounts', function () {
      it('Account deletion warning displays', async function () {
        await SettingsMenuScreen.deleteAccountsButton.click();
        await expect(ConfirmDeleteAccountsScreen.root).toBeDisplayed();
      });

      it('Clicking "Back" button cancels the deletion', async function () {
        await TopMenu.backButton.click();
        await expect(SettingsMenuScreen.root).toBeDisplayed();
      });

      it('Clicking "Cancel" button cancels the deletion', async function () {
        await SettingsMenuScreen.deleteAccountsButton.click();
        await ConfirmDeleteAccountsScreen.cancelButton.click();
        await expect(SettingsMenuScreen.root).toBeDisplayed();
      });

      it('"Delete all" button is disabled', async function () {
        await SettingsMenuScreen.deleteAccountsButton.click();
        await expect(
          ConfirmDeleteAccountsScreen.deleteAllButton,
        ).toBeDisabled();
      });

      it('Wrong confirmation phrase displays error', async function () {
        await ConfirmDeleteAccountsScreen.confirmPhraseInput.setValue(
          'delete all accounts',
        );
        await expect(
          ConfirmDeleteAccountsScreen.deleteAllButton,
        ).toBeDisabled();
        await expect(ConfirmDeleteAccountsScreen.confirmPhraseError).toHaveText(
          'The phrase is entered incorrectly',
        );
      });

      it('Correct confirmation phrase enables "Delete all" button', async function () {
        await ConfirmDeleteAccountsScreen.confirmPhraseInput.setValue(
          'DELETE ALL ACCOUNTS',
        );
        await expect(ConfirmDeleteAccountsScreen.deleteAllButton).toBeEnabled();
      });

      it('Clicking "Delete account" removes all accounts from current network', async function () {
        await ConfirmDeleteAccountsScreen.deleteAllButton.click();
        await expect(GetStartedScreen.root).toBeDisplayed();
      });
    });
  });
});
