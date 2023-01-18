import { ChangePasswordScreen } from './helpers/ChangePasswordScreen';
import { ConfirmDeleteAccountsScreen } from './helpers/ConfirmDeleteAccountsScreen';
import { GetStartedScreen } from './helpers/GetStartedScreen';
import { HomeScreen } from './helpers/HomeScreen';
import { ImportFormScreen } from './helpers/ImportFormScreen';
import { LoginScreen } from './helpers/LoginScreen';
import { NewAccountScreen } from './helpers/NewAccountScreen';
import {
  GeneralSettingsScreen,
  SettingsScreen,
} from './helpers/SettingsScreen';
import { TopMenu } from './helpers/TopMenu';
import { AccountsHome, App, Windows } from './utils/actions';

describe('Password management', () => {
  const PASSWORD = {
    SHORT: 'short',
    DEFAULT: 'strongpassword',
    NEW: 'verystrongpassword',
  };
  let tabKeeper: string, tabAccounts: string;

  after(async function () {
    await App.closeBgTabs(tabKeeper);
  });

  describe('Create password', function () {
    before(async function () {
      tabKeeper = await browser.getWindowHandle();

      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.openKeeperPopup();
      [tabAccounts] = await waitForNewWindows(1);

      await browser.switchToWindow(tabAccounts);
      await browser.refresh();

      await GetStartedScreen.getStartedButton.click();
    });

    beforeEach(async function () {
      await NewAccountScreen.passwordInput.clearValue();
      await NewAccountScreen.passwordConfirmationInput.clearValue();
    });

    it('Minimum password length 8 characters', async function () {
      await NewAccountScreen.passwordInput.setValue(PASSWORD.SHORT);
      expect(await NewAccountScreen.passwordError).toHaveText(
        'Password is too short'
      );
    });

    it('Passwords in both fields must mismatch', async function () {
      await NewAccountScreen.passwordInput.setValue(PASSWORD.DEFAULT);
      await NewAccountScreen.passwordConfirmationInput.setValue(PASSWORD.SHORT);
      expect(await NewAccountScreen.passwordConfirmationError).toHaveText(
        'Passwords do not match'
      );
    });

    it('Passwords in both fields must match', async function () {
      await NewAccountScreen.passwordInput.setValue(PASSWORD.DEFAULT);
      await NewAccountScreen.passwordConfirmationInput.setValue(
        PASSWORD.DEFAULT
      );
      expect(await NewAccountScreen.passwordConfirmationError).toHaveText('');
    });

    it('The ability to paste the password from the clipboard');

    it('Successful password creation', async function () {
      await NewAccountScreen.passwordInput.setValue(PASSWORD.DEFAULT);
      await NewAccountScreen.passwordConfirmationInput.setValue(
        PASSWORD.DEFAULT
      );
      await NewAccountScreen.termsAndConditionsLine.click();
      await NewAccountScreen.privacyPolicyLine.click();
      await NewAccountScreen.continueButton.click();
      expect(await ImportFormScreen.root).toBeDisplayed();
      expect(await ImportFormScreen.createNewAccountButton).toBeDisplayed();
    });
  });

  // this tests starts when we are at create new account page
  describe('Change password', function () {
    before(async function () {
      await browser.switchToWindow(tabKeeper);
      await browser.openKeeperPopup();

      await TopMenu.settingsButton.click();
      await SettingsScreen.generalSectionLink.click();
      await GeneralSettingsScreen.changePasswordLink.click();
    });

    beforeEach(async function () {
      await ChangePasswordScreen.oldPasswordInput.clearValue();
      await ChangePasswordScreen.newPasswordInput.clearValue();
      await ChangePasswordScreen.passwordConfirmationInput.clearValue();
    });

    it('Minimum password length 8 characters', async function () {
      await ChangePasswordScreen.oldPasswordInput.setValue(PASSWORD.SHORT);
      expect(await ChangePasswordScreen.oldPasswordError).toHaveText(
        "Password can't be so short"
      );
      await ChangePasswordScreen.oldPasswordInput.clearValue();

      await ChangePasswordScreen.newPasswordInput.setValue(PASSWORD.SHORT);
      expect(await ChangePasswordScreen.newPasswordInput).toHaveText(
        "Password can't be so short"
      );
      await ChangePasswordScreen.newPasswordInput.clearValue();
    });

    it('The ability to paste the password from the clipboard');

    it('Passwords in both fields must match', async function () {
      await ChangePasswordScreen.newPasswordInput.setValue(PASSWORD.DEFAULT);
      await ChangePasswordScreen.passwordConfirmationInput.setValue(
        PASSWORD.SHORT
      );
      expect(await ChangePasswordScreen.newPasswordInput).toHaveText(
        'New passwords do not match'
      );
      await ChangePasswordScreen.newPasswordInput.clearValue();

      await ChangePasswordScreen.passwordConfirmationInput.setValue(
        PASSWORD.DEFAULT
      );
      expect(await ChangePasswordScreen.passwordConfirmationError).toHaveText(
        ''
      );
    });

    it('New password cannot match old', async function () {
      await ChangePasswordScreen.oldPasswordInput.setValue(PASSWORD.DEFAULT);
      await ChangePasswordScreen.newPasswordInput.setValue(PASSWORD.DEFAULT);

      expect(await ChangePasswordScreen.passwordConfirmationError).toHaveText(
        'Old password is equal new'
      );

      await ChangePasswordScreen.newPasswordInput.clearValue();
      await ChangePasswordScreen.newPasswordInput.setValue(PASSWORD.NEW);
      expect(await ChangePasswordScreen.passwordConfirmationError).toHaveText(
        ''
      );
    });

    it('Successful password changed', async function () {
      await ChangePasswordScreen.oldPasswordInput.setValue(PASSWORD.DEFAULT);
      await ChangePasswordScreen.newPasswordInput.setValue(PASSWORD.NEW);
      await ChangePasswordScreen.passwordConfirmationInput.setValue(
        PASSWORD.NEW
      );
      await ChangePasswordScreen.saveButton.click();
      expect(await ChangePasswordScreen.notification).toHaveText(
        'Password changed'
      );
    });
  });

  describe('Etc', function () {
    async function performLogout() {
      await TopMenu.settingsButton.click();
      await SettingsScreen.logoutButton.click();
    }

    async function performLogin(password: string) {
      await LoginScreen.passwordInput.setValue(password);
      await LoginScreen.enterButton.click();
    }

    before(async function () {
      await browser.switchToWindow(tabAccounts);
      await AccountsHome.importAccount(
        'rich',
        'waves private node seed with waves tokens'
      );
      await browser.switchToWindow(tabKeeper);
      await browser.openKeeperPopup();
    });

    it('Logout', async function () {
      await performLogout();
      expect(await LoginScreen.root).toBeDisplayed();
    });

    it('Incorrect password login', async function () {
      await LoginScreen.passwordInput.setValue(PASSWORD.DEFAULT);
      await LoginScreen.enterButton.click();
      expect(await LoginScreen.passwordError).toHaveText('Wrong password');
      await LoginScreen.passwordInput.clearValue();
    });

    it('Correct password login', async function () {
      await LoginScreen.passwordInput.setValue(PASSWORD.NEW);
      await LoginScreen.enterButton.click();
      expect(await HomeScreen.root).toBeDisplayed();
    });

    describe('Password reset', async function () {
      before(async function () {
        await performLogout();
      });

      it('"I forgot password" button opens recovery page and "Delete all" button is disabled', async function () {
        await LoginScreen.forgotPasswordLink.click();
        expect(await ConfirmDeleteAccountsScreen.root).toBeDisplayed();
        expect(
          await ConfirmDeleteAccountsScreen.deleteAllButton
        ).toBeDisabled();
      });

      it('Clicking "Cancel" button returns to login page and login is available', async function () {
        await ConfirmDeleteAccountsScreen.cancelButton.click();
        expect(await LoginScreen.passwordInput).toBeDisplayed();

        await performLogin(PASSWORD.NEW);
        expect(await HomeScreen.root).toBeDisplayed();
        await performLogout();
      });

      describe('Delete all', function () {
        before(async function () {
          await LoginScreen.forgotPasswordLink.click();
        });

        beforeEach(async function () {
          await ConfirmDeleteAccountsScreen.confirmPhraseInput.clearValue();
        });

        it('Entering right confirmation phrase enables "Delete all" button', async function () {
          await ConfirmDeleteAccountsScreen.confirmPhraseInput.setValue(
            'DELETE ALL ACCOUNTS'
          );
          expect(
            await ConfirmDeleteAccountsScreen.confirmPhraseError
          ).toHaveText('');
          expect(
            await ConfirmDeleteAccountsScreen.deleteAllButton
          ).toBeEnabled();
        });

        it('Entering wrong confirmation phrase disables "Delete all" button', async function () {
          await ConfirmDeleteAccountsScreen.confirmPhraseInput.setValue(
            'delete all accounts'
          );
          expect(
            await ConfirmDeleteAccountsScreen.confirmPhraseError
          ).toHaveText('The phrase is entered incorrectly');
          expect(
            await ConfirmDeleteAccountsScreen.deleteAllButton
          ).toBeDisabled();
        });

        it('Entering right phrase and clicking "Delete all" removes all accounts', async function () {
          await ConfirmDeleteAccountsScreen.confirmPhraseInput.setValue(
            'DELETE ALL ACCOUNTS'
          );
          await ConfirmDeleteAccountsScreen.deleteAllButton.click();

          expect(await GetStartedScreen.root).toBeDisplayed();
        });
      });
    });
  });
});
