import { rename, rm } from 'node:fs/promises';

import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { HomeScreen } from './helpers/HomeScreen';
import { LoginScreen } from './helpers/LoginScreen';
import { OtherAccountsScreen } from './helpers/OtherAccountsScreen';
import { TopMenu } from './helpers/TopMenu';
import { Windows } from './helpers/Windows';
import { DEFAULT_PASSWORD } from './utils/constants';

// This test requires both dist/ (old version) and dist.new/ (new version) to exist.
// Run using: ./scripts/test-migration-from-tag.sh
// Or manually prepare both folders before running yarn test:update
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
    // Swap the extension files
    await rm('dist', { recursive: true, force: true });
    await rename('dist.new', 'dist');

    // Navigate to chrome://extensions page
    await browser.openKeeperExtensionPage();

    // Click the reload button for the extension using shadow DOM
    await browser.execute(() => {
      const manager = document.querySelector('extensions-manager');
      const itemsList = manager?.shadowRoot?.querySelector(
        'extensions-item-list',
      );
      const items = itemsList?.shadowRoot?.querySelectorAll('extensions-item');

      if (!items) return;

      for (const item of Array.from(items)) {
        const nameEl = item.shadowRoot?.querySelector('#name');
        if (nameEl?.textContent?.toLowerCase().includes('keeper wallet')) {
          // Find and click the reload button
          const reloadButton = item.shadowRoot?.querySelector(
            '#dev-reload-button',
          ) as HTMLElement;
          if (reloadButton) {
            reloadButton.click();
          }
          break;
        }
      }
    });

    // Wait for extension to reload
    await browser.pause(3000);

    // Navigate back to popup
    await browser.openKeeperPopup();

    // Wait for login screen to appear
    await browser.waitUntil(
      async () => {
        const loginExists = await browser.execute(() => {
          return !!document.querySelector("[class*='content@login']");
        });
        return loginExists;
      },
      {
        timeout: 10000,
        timeoutMsg: 'Login screen did not appear after extension reload',
      },
    );

    await LoginScreen.passwordInput.setValue(DEFAULT_PASSWORD);
    await LoginScreen.enterButton.click();

    // After migration, all accounts should be accessible on all networks

    // Verify all 4 accounts on Mainnet
    const mainnetAccounts = await collectAllAccountNames();
    expect(mainnetAccounts.sort()).toStrictEqual(
      ['test', 'test2', 'test3', 'test4'].sort(),
    );
    console.log('Mainnet: All 4 accounts present:', mainnetAccounts);

    // Switch to Testnet directly via storage and verify all accounts
    await browser.execute(() => {
      chrome.storage.local.set({ currentNetwork: 'testnet' });
    });
    await browser.refresh();
    await browser.pause(1000);

    const testnetAccounts = await collectAllAccountNames();
    expect(testnetAccounts.sort()).toStrictEqual(
      ['test', 'test2', 'test3', 'test4'].sort(),
    );
    console.log('Testnet: All 4 accounts present:', testnetAccounts);

    // Switch to Stagenet directly via storage and verify all accounts
    await browser.execute(() => {
      chrome.storage.local.set({ currentNetwork: 'stagenet' });
    });
    await browser.refresh();
    await browser.pause(1000);

    const stagenetAccounts = await collectAllAccountNames();
    expect(stagenetAccounts.sort()).toStrictEqual(
      ['test', 'test2', 'test3', 'test4'].sort(),
    );
    console.log('Stagenet: All 4 accounts present:', stagenetAccounts);

    console.log(
      'Migration successful! All accounts have addresses on all networks',
    );
  });
});
