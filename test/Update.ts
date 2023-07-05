import { rename, rm } from 'node:fs/promises';

import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { ExtensionPage } from './helpers/ExtensionPage';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { Network } from './helpers/flows/Network';
import { HomeScreen } from './helpers/HomeScreen';
import { LoginScreen } from './helpers/LoginScreen';
import { OtherAccountsScreen } from './helpers/OtherAccountsScreen';
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

    await AccountsHome.importKeystoreFile(
      '/app/test/fixtures/keystore-keeper.json',
      'xHZ7Zaxu2wuncWC',
    );
    await browser.openKeeperPopup();
  });

  async function collectAllAccountNames() {
    const activeAccountName = await HomeScreen.activeAccountName.getText();
    await HomeScreen.otherAccountsButton.click();
    const accounts = await OtherAccountsScreen.accounts;
    const otherAccountNames = await Promise.all(
      accounts.map(it => it.name.getText()),
    );
    await TopMenu.backButton.click();
    return [activeAccountName, ...otherAccountNames];
  }

  it('accounts persist on update', async () => {
    await browser.openKeeperExtensionPage();
    await rm('dist', { recursive: true, force: true });
    await rename('dist.new', 'dist');

    await ExtensionPage.devModeToggle.click();
    await browser.pause(100);
    await ExtensionPage.updateButton.click();
    browser.waitUntil(async () => {
      return (
        (await ExtensionPage.enableToggle.getAttribute('aria-pressed')) ===
        'false'
      );
    }, {});
    await browser.waitUntil(async () => {
      return (
        (await ExtensionPage.enableToggle.getAttribute('aria-pressed')) ===
        'true'
      );
    }, {});

    await browser.openKeeperPopup();
    await LoginScreen.passwordInput.setValue(DEFAULT_PASSWORD);
    await LoginScreen.enterButton.click();

    expect(await collectAllAccountNames()).toStrictEqual(['test2']);
    await Network.switchToAndCheck('Testnet');
    expect(await collectAllAccountNames()).toStrictEqual(['test', 'test3']);

    await Network.switchToAndCheck('Stagenet');
    expect(await collectAllAccountNames()).toStrictEqual(['test4']);
  });
});
