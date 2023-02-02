import { exec } from 'child_process';
import * as util from 'util';

import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { ExtensionPage } from './helpers/ExtensionPage';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { Network } from './helpers/flows/Network';
import { HomeScreen } from './helpers/HomeScreen';
import { LoginScreen } from './helpers/LoginScreen';
import { OtherAccountsScreen } from './helpers/OtherAccountsScreen';
import { SettingsMenuScreen } from './helpers/settings/SettingsMenuScreen';
import { TopMenu } from './helpers/TopMenu';
import { Windows } from './helpers/Windows';
import { DEFAULT_PASSWORD } from './utils/constants';

describe('Update extension', () => {
  before(async () => {
    await App.initVault();
    const tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
    const [tabAccounts] = await waitForNewWindows(1);
    await browser.switchToWindow(tabKeeper);
    await browser.closeWindow();
    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await AccountsHome.importAccount(
      'Test',
      'waves private node seed with waves tokens'
    );
    await AccountsHome.importKeystoreFile(
      '/app/test/fixtures/keystore-keeper.json',
      'xHZ7Zaxu2wuncWC'
    );
    await browser.openKeeperPopup();
    await TopMenu.settingsButton.click();
    await SettingsMenuScreen.logoutButton.click();
    await expect(LoginScreen.root).toBeDisplayed();
  });

  async function collectAllAccountNames() {
    const activeAccountName = await HomeScreen.activeAccountName.getText();
    await HomeScreen.otherAccountsButton.click();
    const otherAccountNames = await Promise.all(
      (await OtherAccountsScreen.accounts).map(it => it.name.getText())
    );
    await TopMenu.backButton.click();
    return [activeAccountName, ...otherAccountNames];
  }

  it('accounts persist on update', async () => {
    const promisifiedExec = util.promisify(exec);
    await browser.openKeeperExtensionPage();
    await promisifiedExec('rm -rf dist/chrome');
    await promisifiedExec('mv new_dist/chrome dist');

    await ExtensionPage.devModeToggle.click();
    await browser.pause(500);
    await ExtensionPage.updateButton.click();
    await browser.pause(500);

    await browser.openKeeperPopup();
    await LoginScreen.passwordInput.setValue(DEFAULT_PASSWORD);
    await LoginScreen.enterButton.click();

    expect(await collectAllAccountNames()).toStrictEqual(['Test', 'test2']);
    await Network.switchToAndCheck('Testnet');
    expect(await collectAllAccountNames()).toStrictEqual(['test', 'test3']);

    await Network.switchToAndCheck('Stagenet');
    expect(await collectAllAccountNames()).toStrictEqual(['test4']);
  });
});
