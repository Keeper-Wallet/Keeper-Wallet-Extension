import { AccountInfoScreen } from './helpers/AccountInfoScreen';
import { ChangeAccountNameScreen } from './helpers/ChangeAccountNameScreen';
import { DeleteAccountScreen } from './helpers/DeleteAccountScreen';
import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { Network } from './helpers/flows/Network';
import { HomeScreen } from './helpers/HomeScreen';
import { OtherAccountsScreen } from './helpers/OtherAccountsScreen';
import { TopMenu } from './helpers/TopMenu';
import { Windows } from './helpers/Windows';

describe('Account management', function () {
  let tabKeeper: string, tabAccounts: string;

  before(async () => {
    await App.initVault();
    tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
    [tabAccounts] = await waitForNewWindows(1);
    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await AccountsHome.importAccount(
      'poor',
      'waves private node seed without waves tokens',
    );

    await AccountsHome.importAccount(
      'rich',
      'waves private node seed with waves tokens',
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
      await (await OtherAccountsScreen.accounts)[0].root.click();

      await expect(HomeScreen.activeAccountName).toHaveText('poor');
    });

    it('Updating account balances on import');
    it('The balance reflects the leased WAVES');
    it('Copying the address of the active account on the accounts screen');

    describe('Show QR', () => {
      after(async () => {
        await TopMenu.backButton.click();
      });

      it('Opening the screen with the QR code of the address by clicking the "Show QR" button', async () => {
        await HomeScreen.showQRButton.click();
        await $('[class^="content@SelectedAccountQr-module"]').waitForExist();
      });

      it('Check that QR matches the displayed address');
      it('Download QR code'); // file downloaded, filename equals "${address}.png"
    });

    describe('Search', () => {
      before(async () => {
        await HomeScreen.otherAccountsButton.click();
      });

      after(async () => {
        await TopMenu.backButton.click();
      });

      it('Displays "not found" description if term is not account name, address, public key or email', async () => {
        await OtherAccountsScreen.searchInput.setValue('WRONG TERM');
        expect(await OtherAccountsScreen.accounts).toHaveLength(0);
        await expect(OtherAccountsScreen.accountsNote).toHaveText(
          'No other accounts were found for the specified filters',
        );
      });

      it('"x" appears and clear search input', async () => {
        await OtherAccountsScreen.searchInput.setValue('WRONG TERM');
        await OtherAccountsScreen.searchClearButton.click();
        await expect(OtherAccountsScreen.searchInput).toHaveText('');
      });

      it('By existing account name', async () => {
        await OtherAccountsScreen.searchInput.setValue('ic');
        await expect((await OtherAccountsScreen.accounts)[0].name).toHaveText(
          'rich',
        );
      });

      it('By existing account address', async () => {
        await OtherAccountsScreen.searchInput.setValue(
          '3P5Xx9MFs8VchRjfLeocGFxXkZGknm38oq1',
        );
        await expect((await OtherAccountsScreen.accounts)[0].name).toHaveText(
          'rich',
        );
      });

      it('By existing account public key', async () => {
        await OtherAccountsScreen.searchInput.setValue(
          'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
        );
        await expect((await OtherAccountsScreen.accounts)[0].name).toHaveText(
          'rich',
        );
      });

      it('By existing email account');
    });
  });

  function accountPropertiesShouldBeRight() {
    describe('Address', () => {
      it('Is displayed', async () => {
        expect(await AccountInfoScreen.address.getText()).toMatch(/\w+/i);
      });

      it('Copying by clicking the "Copy" button');
    });

    describe('Public key', () => {
      it('Is displayed', async () => {
        expect(await AccountInfoScreen.publicKey.getText()).toMatch(/\w+/i);
      });

      it('Copying by clicking the "Copy" button');
    });

    describe('Private key', () => {
      it('Is hidden', async () => {
        expect(await AccountInfoScreen.privateKey.getText()).toMatch(/\w+/i);
      });

      describe('Copying by clicking the "Copy" button', () => {
        before(async () => {
          await AccountInfoScreen.privateKeyCopyButton.click();
        });

        it('Clicking "Copy" displays the password entry form', async () => {
          await AccountInfoScreen.passwordModal.passwordInput.waitForExist();
          await AccountInfoScreen.passwordModal.cancelButton.click();
        });

        it('Clicking "Cancel" does not copy');
        it('Clicking "Copy" and entering the correct password will copy it');
      });
    });

    describe('Backup phrase', () => {
      it('Is hidden', async () => {
        expect(await AccountInfoScreen.backupPhrase.getText()).not.toMatch(
          /\w+/i,
        );
      });

      describe('Copying by clicking the "Copy" button', () => {
        before(async () => {
          await AccountInfoScreen.backupPhraseCopyButton.click();
          await AccountInfoScreen.passwordModal.passwordInput.waitForExist();
        });

        after(async () => {
          await AccountInfoScreen.passwordModal.cancelButton.click();
        });

        it('Clicking "Cancel" does not copy');
        it('Clicking "Copy" and entering the correct password will copy it');
      });
    });

    describe('Rename an account', () => {
      let currentAccountName: string;
      let newAccountName: string;

      before(async () => {
        await AccountInfoScreen.name.click();
        currentAccountName =
          await ChangeAccountNameScreen.currentName.getText();
      });

      it('A name that is already in use cannot be specified', async () => {
        await ChangeAccountNameScreen.newNameInput.setValue(currentAccountName);
        await browser.keys('Tab');
        await expect(ChangeAccountNameScreen.error).toHaveText(
          'Name already exist',
        );
        await expect(ChangeAccountNameScreen.saveButton).toBeDisabled();
        await ChangeAccountNameScreen.newNameInput.clearValue();
      });

      it('Unique name specified', async () => {
        newAccountName = currentAccountName.slice(1);
        await ChangeAccountNameScreen.newNameInput.setValue(newAccountName);
        await browser.keys('Tab');
        await expect(ChangeAccountNameScreen.error).toHaveText('');
        await expect(ChangeAccountNameScreen.saveButton).toBeEnabled();
      });

      it('Successfully changed account name', async () => {
        await ChangeAccountNameScreen.saveButton.click();

        await expect(AccountInfoScreen.notification).toHaveText(
          'Account name changed',
        );
        await expect(AccountInfoScreen.name).toHaveText(newAccountName);
      });
    });

    describe('Delete account', () => {
      beforeEach(async () => {
        await AccountInfoScreen.deleteAccountButton.click();
      });

      it('Click "Back" on the account deletion confirmation screen - the account is not deleted', async () => {
        await TopMenu.backButton.click();
        await expect(AccountInfoScreen.name).toBeDisplayed();
      });

      it('Click "Delete account" deletes the account', async () => {
        await DeleteAccountScreen.deleteAccountButton.click();
        expect(
          (await HomeScreen.isDisplayed()) ||
            (await EmptyHomeScreen.isDisplayed()),
        ).toBe(true);
      });
    });
  }

  describe('Inactive account', async () => {
    before(async () => {
      await HomeScreen.otherAccountsButton.click();
    });

    it('By clicking on account - go to the account properties screen', async () => {
      (await OtherAccountsScreen.accounts)[0].accountInfoButton.click();
      await expect(AccountInfoScreen.root).toBeDisplayed();
    });

    accountPropertiesShouldBeRight();
  });

  describe('Active account', async () => {
    it('By clicking on account - go to the account properties screen', async () => {
      await HomeScreen.activeAccountCard.click();
    });

    accountPropertiesShouldBeRight();
  });

  describe('Switching networks', () => {
    before(async () => {
      await browser.switchToWindow(tabKeeper);
      await browser.openKeeperPopup();

      await Network.enableTestNetworks();

      // enableTestNetworks closes the popup, so reopen it
      await browser.openKeeperPopup();

      await browser.switchToWindow(tabAccounts);

      await AccountsHome.importAccount(
        'second',
        'second account for testing selected account preservation',
      );

      await AccountsHome.importAccount(
        'first',
        'first account for testing selected account preservation',
      );

      await browser.switchToWindow(tabKeeper);
      await browser.openKeeperPopup();
      await Network.switchToAndCheck('Testnet');

      await browser.switchToWindow(tabAccounts);
      await AccountsHome.importAccount(
        'fourth',
        'fourth account for testing selected account preservation',
      );

      await AccountsHome.importAccount(
        'third',
        'third account for testing selected account preservation',
      );

      await browser.switchToWindow(tabKeeper);
      await browser.openKeeperPopup();
      await Network.switchToAndCheck('Mainnet');

      await browser.switchToWindow(tabKeeper);
    });

    after(async () => {
      await browser.switchToWindow(tabKeeper);
      await browser.openKeeperPopup();
      await Network.switchToAndCheck('Mainnet');
    });

    it('should preserve previously selected account for the network', async () => {
      // Select "second" account on Mainnet
      await HomeScreen.otherAccountsButton.click();
      const accounts = await OtherAccountsScreen.accounts;

      // Find and click the "second" account
      let secondAccount = null;
      for (const account of accounts) {
        const name = await account.name.getText();
        if (name === 'second') {
          secondAccount = account;
          break;
        }
      }
      await secondAccount?.root.click();
      await expect(HomeScreen.activeAccountName).toHaveText('second');

      // Switch to Testnet
      await Network.switchToAndCheck('Testnet');

      // Select "fourth" account on Testnet
      await HomeScreen.otherAccountsButton.click();
      const testnetAccounts = await OtherAccountsScreen.accounts;

      // Find and click the "fourth" account
      let fourthAccount = null;
      for (const account of testnetAccounts) {
        const name = await account.name.getText();
        if (name === 'fourth') {
          fourthAccount = account;
          break;
        }
      }
      await fourthAccount?.root.click();
      await expect(HomeScreen.activeAccountName).toHaveText('fourth');

      // Switch back to Mainnet
      // Note: Current behavior is that switching accounts always goes to Mainnet,
      // so "fourth" will be selected on Mainnet (not "second")
      await Network.switchToAndCheck('Mainnet');
      await expect(HomeScreen.activeAccountName).toHaveText('fourth');

      // Switch to Testnet - "fourth" should still be selected
      await Network.switchToAndCheck('Testnet');
      await expect(HomeScreen.activeAccountName).toHaveText('fourth');
    });
  });
});
