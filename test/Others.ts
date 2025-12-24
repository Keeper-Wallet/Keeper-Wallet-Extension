import { ContentScript } from './helpers/ContentScript';
import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { Network } from './helpers/flows/Network';
import { PopupHome } from './helpers/flows/PopupHome';
import { HomeScreen } from './helpers/HomeScreen';
import { CommonTransaction } from './helpers/messages/CommonTransaction';
import { FinalTransactionScreen } from './helpers/messages/FinalTransactionScreen';
import { TransferTransactionScreen } from './helpers/messages/TransferTransactionScreen';
import { SendAssetScreen } from './helpers/SendAssetScreen';
import { Windows } from './helpers/Windows';

describe('Others', function () {
  before(async function () {
    await App.initVault();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
    const [tabAccounts] = await waitForNewWindows(1);

    const tabKeeper = await browser.getWindowHandle();
    await browser.switchToWindow(tabKeeper);
    await browser.openKeeperPopup();
    await Network.enableTestNetworks();

    // enableTestNetworks closes the popup, so reopen it
    await browser.openKeeperPopup();
    await Network.switchToAndCheck('Testnet');

    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await AccountsHome.importAccount(
      'rich',
      'waves private node seed with waves tokens',
    );

    // After importing, app switches to Mainnet, so switch back to Testnet
    await browser.switchToWindow(tabKeeper);
    await browser.openKeeperPopup();
    await Network.switchToAndCheck('Testnet');

    const newTab = (await browser.createWindow('tab')).handle;
    await browser.switchToWindow(tabAccounts);
    await browser.closeWindow();
    await browser.switchToWindow(newTab);
  });

  after(async function () {
    await browser.openKeeperPopup();
    await Network.switchToAndCheck('Mainnet');
    await App.resetVault();
  });

  it(
    'After signAndPublishTransaction() "View transaction" button leads to the correct Explorer',
  );

  it(
    'Signature requests are automatically removed from pending requests after 30 minutes',
  );

  it('Switch account on confirmation screen');

  it('Send more transactions for signature when different screens are open');

  describe('Send WAVES', function () {
    before(async () => {
      await browser.openKeeperPopup();
      // Wait for assets to load after importing account
      await browser.pause(3000);
    });

    beforeEach(async function () {
      const assetCard = await HomeScreen.getAssetByName('WAVES');
      await assetCard.moreButton.moveTo();
      await assetCard.sendButton.click();
    });

    afterEach(async function () {
      await TransferTransactionScreen.rejectButton.click();
      await FinalTransactionScreen.closeButton.click();
    });

    it('Send WAVES to an address', async function () {
      await SendAssetScreen.recipientInput.setValue(
        '3MsX9C2MzzxE4ySF5aYcJoaiPfkyxZMg4cW',
      );
      await SendAssetScreen.amountInput.setValue('123123123.123');

      expect(await SendAssetScreen.amountInput.getValue()).toBe(
        '123 123 123.123',
      );

      await SendAssetScreen.amountInput.clearValue();
      await SendAssetScreen.amountInput.setValue('0.0123');

      await SendAssetScreen.attachmentInput.setValue('This is an attachment');

      await SendAssetScreen.submitButton.click();

      // Wait for transaction screen to appear
      await TransferTransactionScreen.root.waitForDisplayed({ timeout: 5000 });

      await expect(TransferTransactionScreen.transferAmount).toHaveText(
        '-0.01230000 WAVES',
      );
      await expect(TransferTransactionScreen.recipient).toHaveText(
        'rich\n3MsX9C2M...yxZMg4cW',
      );
      await expect(TransferTransactionScreen.attachmentContent).toHaveText(
        'This is an attachment',
      );
    });

    it('Send assets to an alias', async function () {
      await SendAssetScreen.recipientInput.setValue('alias:T:an_alias');
      await SendAssetScreen.amountInput.setValue('0.87654321');
      await SendAssetScreen.attachmentInput.setValue('This is an attachment');

      await SendAssetScreen.submitButton.click();

      await expect(TransferTransactionScreen.transferAmount).toHaveText(
        '-0.87654321 WAVES',
      );
      await expect(TransferTransactionScreen.recipient).toHaveText(
        'alias:T:an_alias',
      );
      await expect(TransferTransactionScreen.attachmentContent).toHaveText(
        'This is an attachment',
      );
    });
  });

  // Skipped: flaky in CI due to script timeout issues
  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip('Connection', () => {
    async function stopServiceWorker() {
      await browser.navigateTo('chrome://serviceworker-internals');
      await $('.content .stop').click();
      await $('.content .stop').waitForDisplayed({ reverse: true });
    }

    it('ui waits until connection with background is established before trying to call methods', async function () {
      await stopServiceWorker();
      await browser.openKeeperPopup();

      const { waitForNewWindows } = await Windows.captureNewWindows();
      await PopupHome.addAccount();
      const [tabAccounts] = await waitForNewWindows(1);
      await stopServiceWorker();
      await browser.closeWindow();

      await browser.switchToWindow(tabAccounts);
      await browser.refresh();

      await expect(EmptyHomeScreen.root).toBeDisplayed();

      const newTab = (await browser.createWindow('tab')).handle;

      await browser.switchToWindow(tabAccounts);
      await browser.closeWindow();
      await browser.switchToWindow(newTab);
    });

    it('contentscript waits until connection is established before trying to call methods', async function () {
      await browser.navigateTo('https://example.com');

      const prevHandle = await browser.getWindowHandle();
      await browser.switchToWindow((await browser.createWindow('tab')).handle);
      await stopServiceWorker();
      await browser.closeWindow();
      await browser.switchToWindow(prevHandle);

      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();
      await browser.execute(() => {
        KeeperWallet.auth({ data: 'hello' });
      });
      const [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();

      await expect(CommonTransaction.originAddress).toHaveText('example.com');
      await expect(CommonTransaction.accountName).toHaveText('rich');
      await expect(CommonTransaction.originNetwork).toHaveText('Testnet');

      await CommonTransaction.rejectButton.click();
      await FinalTransactionScreen.closeButton.click();

      await Windows.waitForWindowToClose(messageWindow);
      await browser.switchToWindow(prevHandle);
      await browser.refresh();
    });
  });
});
