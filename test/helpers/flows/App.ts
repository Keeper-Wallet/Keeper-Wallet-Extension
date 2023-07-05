import { DEFAULT_PASSWORD } from '../../utils/constants';
import { ConfirmDeleteAccountsScreen } from '../ConfirmDeleteAccountsScreen';
import { GetStartedScreen } from '../GetStartedScreen';
import { ImportFormScreen } from '../ImportFormScreen';
import { NewAccountScreen } from '../NewAccountScreen';
import { SettingsMenuScreen } from '../settings/SettingsMenuScreen';
import { TopMenu } from '../TopMenu';
import { Windows } from '../Windows';

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
    await NewAccountScreen.termsAndConditionsCheckbox.click();
    await NewAccountScreen.privacyPolicyCheckbox.click();
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
      'DELETE ALL ACCOUNTS',
    );
    await ConfirmDeleteAccountsScreen.deleteAllButton.click();

    await expect(GetStartedScreen.getStartedButton).toBeDisplayed();
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
