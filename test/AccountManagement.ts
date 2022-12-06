import { expect } from 'expect-webdriverio';

import { AccountInfoScreen } from "./pageobject/AccountInfoScreen";
import { ChangeAccountNameScreen } from "./pageobject/ChangeAccountNameScreen";
import { Common } from "./pageobject/Common";
import { EmptyHomeScreen } from "./pageobject/EmptyHomeScreen";
import { HomeScreen } from "./pageobject/HomeScreen";
import { OtherAccountsScreen } from "./pageobject/OtherAccountsScreen";
import { AccountsHome, App, Network, PopupHome, Settings, Windows, } from './utils/actions';

describe('Account management', function () {
  let tabKeeper: string, tabAccounts: string;

  before(async () => {
    await App.initVault();
    await Settings.setMaxSessionTimeout();
    await browser.openKeeperPopup();
    tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
    [tabAccounts] = await waitForNewWindows(1);
    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await AccountsHome.importAccount(
      'poor',
      'waves private node seed without waves tokens'
    );

    await AccountsHome.importAccount(
      'rich',
      'waves private node seed with waves tokens'
    );

    await browser.switchToWindow(tabKeeper);
    await browser.openKeeperPopup();
  });

  after(async () => {
    await browser.switchToWindow(tabAccounts);
    await browser.closeWindow();
    await browser.switchToWindow(tabKeeper);
    await App.resetVault();
  });

  describe('Accounts list', () => {
    it('Change active account', async () => {
      await HomeScreen.otherAccountsButton.click();
      await (await OtherAccountsScreen.accounts)[0].select();

      expect(HomeScreen.activeAccountNameField).toHaveText("poor");
    });

    it('Updating account balances on import');
    it('The balance reflects the leased WAVES');
    it('Copying the address of the active account on the accounts screen');

    describe('Show QR', () => {
      after(async () => {
        await Common.backButton.click();
      });

      it('Opening the screen with the QR code of the address by clicking the "Show QR" button', async () => {
        await HomeScreen.showQRButton.click();
        await browser.$('[class^="content@SelectedAccountQr-module"]').waitForExist();
      });

      it('Check that QR matches the displayed address');
      it('Download QR code'); // file downloaded, filename equals "${address}.png"
    });

    describe('Search', () => {
      before(async () => {
        await HomeScreen.otherAccountsButton.click();
      });

      after(async () => {
        await Common.backButton.click();
      });

      it('Displays "not found" description if term is not account name, address, public key or email', async () => {
        await OtherAccountsScreen.searchInput.setValue("WRONG TERM");
        expect(await OtherAccountsScreen.accounts).toHaveLength(0);
        expect(await OtherAccountsScreen.accountsNoteField).toHaveText("No other accounts were found for the specified filters");
      });

      it('"x" appears and clear search input', async () => {
        await OtherAccountsScreen.searchInput.setValue("WRONG TERM");
        await OtherAccountsScreen.searchClearButton.click();
        expect(await OtherAccountsScreen.searchInput).toHaveText("");
      });

      it('By existing account name', async () => {
        await OtherAccountsScreen.searchInput.setValue("ic");
        expect((await OtherAccountsScreen.accounts)[0].nameField).toHaveText("rich");
      });

      it('By existing account address', async () => {
        await OtherAccountsScreen.searchInput.setValue("3P5Xx9MFs8VchRjfLeocGFxXkZGknm38oq1");
        expect((await OtherAccountsScreen.accounts)[0].nameField).toHaveText("rich");
      });

      it('By existing account public key', async () => {
        await OtherAccountsScreen.searchInput.setValue("AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV");
        expect((await OtherAccountsScreen.accounts)[0].nameField).toHaveText("rich");
      });

      it('By existing email account');
    });
  });

  function accountPropertiesShouldBeRight() {
    describe('Address', () => {
      it('Is displayed', async () => {
        expect(await AccountInfoScreen.addressField.getText()).toMatch(/\w+/i);
      });

      it('Copying by clicking the "Copy" button');
    });

    describe('Public key', () => {
      it('Is displayed', async () => {
        expect(await AccountInfoScreen.publicKeyField.getText()).toMatch(/\w+/i);
      });

      it('Copying by clicking the "Copy" button');
    });

    describe('Private key', () => {
      it('Is hidden', async () => {
        expect(await AccountInfoScreen.privateKeyField.getText()).toMatch(/\w+/i);
      });

      describe('Copying by clicking the "Copy" button', () => {
        before(async () => {
          await AccountInfoScreen.privateKeyCopyButton.click();
        });

        it('Clicking "Copy" displays the password entry form', async () => {
          await AccountInfoScreen.modalPasswordInput.waitForExist();
          await AccountInfoScreen.modalCancelButton.click();
        });

        it('Clicking "Cancel" does not copy');
        it('Clicking "Copy" and entering the correct password will copy it');
      });
    });

    describe('Backup phrase', () => {
      it('Is hidden', async () => {
        expect(await AccountInfoScreen.backupPhraseField.getText()).toMatch(/\w+/i);
      });

      describe('Copying by clicking the "Copy" button', () => {
        before(async () => {
          await AccountInfoScreen.backupPhraseCopyButton.click();
          await AccountInfoScreen.modalPasswordInput.waitForExist();
        });

        after(async () => {
          await AccountInfoScreen.modalCancelButton.click();
        });

        it('Clicking "Cancel" does not copy');
        it('Clicking "Copy" and entering the correct password will copy it');
      });
    });

    describe('Rename an account', () => {
      let currentAccountName: string;
      let newAccountName: string;

      before(async () => {
        await AccountInfoScreen.nameField.click();
        currentAccountName = await ChangeAccountNameScreen.currentNameField.getText();
      });

      it('A name that is already in use cannot be specified', async () => {
        await ChangeAccountNameScreen.newNameInput.setValue(currentAccountName);
        await browser.keys('Tab');
        expect(await ChangeAccountNameScreen.errorField).toHaveText("Name already exist");
        expect(await ChangeAccountNameScreen.saveButton).toBeDisabled();
        await ChangeAccountNameScreen.newNameInput.clearValue();
      });

      it('Unique name specified', async () => {
        newAccountName = currentAccountName.slice(1);
        await $('#newAccountName').setValue(newAccountName);
        await browser.keys('Tab');
        expect(await $('[data-testid="newAccountNameError"]').getText()).toBe("");
        expect(await $('#save').isEnabled()).toBe(true);
      });

      it('Successfully changed account name', async () => {
        await $('#save').click();

        const notification = await $('.modal.notification');
        await notification.waitForDisplayed();

        await browser.waitUntil(
          async () => (await notification.getText()) === 'Account name changed',
          {
            timeoutMsg: 'notification text is incorrect',
          }
        );

        await browser.waitUntil(
          async () =>
            (await $(
              "//button[contains(@class, 'accountName@accountInfo')]//span"
            ).getText()) === newAccountName,
          {
            timeoutMsg: 'account name did not change',
          }
        );
      });
    });

    describe('Delete account', () => {
      beforeEach(async () => {
        await $("//div[contains(@class, 'deleteButton@accountInfo')]").click();

        await $(
          "//div[contains(@class, 'content@deleteAccount-module')]"
        ).waitForExist();
      });

      it('Click "Back" on the account deletion confirmation screen - the account is not deleted', async () => {
        await $('div.arrow-back-icon').click();

        await $(
          "//div[contains(@class, 'content@accountInfo')]"
        ).waitForExist();
      });

      it('Click "Delete account" deletes the account', async () => {
        await $('button#deleteAccount').click();

        await $(
          '[data-testid="importForm"], [data-testid="assetsForm"]'
        ).waitForExist();
      });
    });
  }

  describe('Inactive account', async () => {
    before(async () => {
      await HomeScreen.otherAccountsButton.click();
    });

    it('By clicking on account - go to the account properties screen', async () => {
      (await OtherAccountsScreen.accounts)[0].accountInfoButton.click();
      expect(await AccountInfoScreen.root).toBeDisplayed();
    });

    accountPropertiesShouldBeRight();
  });

  describe('Active account', async () => {
    it('By clicking on account - go to the account properties screen', async () => {
      await $('[data-testid="activeAccountCard"]').click();
      await $("//div[contains(@class, 'content@accountInfo')]").waitForExist();
    });

    accountPropertiesShouldBeRight();
  });

  describe('Switching networks', () => {
    before(async () => {
      await browser.switchToWindow(tabAccounts);

      await AccountsHome.importAccount(
        'second',
        'second account for testing selected account preservation'
      );

      await AccountsHome.importAccount(
        'first',
        'first account for testing selected account preservation'
      );

      await Network.switchToAndCheck('Testnet');

      await AccountsHome.importAccount(
        'fourth',
        'fourth account for testing selected account preservation'
      );

      await AccountsHome.importAccount(
        'third',
        'third account for testing selected account preservation'
      );

      await Network.switchToAndCheck('Mainnet');
      await browser.switchToWindow(tabKeeper);
    });

    after(async () => {
      await Network.switchToAndCheck('Mainnet');
    });

    it('should preserve previously selected account for the network', async () => {
      await $('[data-testid="otherAccountsButton"]').click();
      await $('[data-testid="otherAccountsPage"]').waitForExist();
      await $('[data-testid="accountCard"]').click();

      await browser.waitUntil(
        async () => (await PopupHome.getActiveAccountName()) === 'second',
        {
          timeoutMsg: 'selected account did not change',
        }
      );

      await Network.switchToAndCheck('Testnet');

      await $('[data-testid="otherAccountsButton"]').click();
      await $('[data-testid="otherAccountsPage"]').waitForExist();
      await $('[data-testid="accountCard"]').click();

      await browser.waitUntil(
        async () => (await PopupHome.getActiveAccountName()) === 'fourth',
        {
          timeoutMsg: 'selected account did not change',
        }
      );

      await Network.switchToAndCheck('Mainnet');
      expect(await PopupHome.getActiveAccountName()).toBe('second');

      await Network.switchToAndCheck('Testnet');
      expect(await PopupHome.getActiveAccountName()).toBe('fourth');
    });
  });
});
