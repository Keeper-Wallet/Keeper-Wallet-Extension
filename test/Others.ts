import { expect } from 'expect-webdriverio';

import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { HomeScreen } from './helpers/HomeScreen';
import { SendAssetScreen } from './helpers/SendAssetScreen';
import { CommonTransaction } from './helpers/transactions/CommonTransaction';
import { FinalTransactionScreen } from './helpers/transactions/FinalTransactionScreen';
import { TransferTransactionScreen } from './helpers/transactions/TransferTransactionScreen';
import {
  AccountsHome,
  App,
  Network,
  PopupHome,
  Settings,
  Windows,
} from './utils/actions';

describe('Others', function () {
  before(async function () {
    await App.initVault();
    await Settings.setMaxSessionTimeout();
    await browser.openKeeperPopup();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
    const [tabAccounts] = await waitForNewWindows(1);
    await browser.closeWindow();

    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await Network.switchToAndCheck('Testnet');

    await AccountsHome.importAccount(
      'rich',
      'waves private node seed with waves tokens'
    );

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
    'After signAndPublishTransaction() "View transaction" button leads to the correct Explorer'
  );

  it(
    'Signature requests are automatically removed from pending requests after 30 minutes'
  );

  it('Switch account on confirmation screen');

  it('Send more transactions for signature when different screens are open');

  describe('Send WAVES', function () {
    before(async () => {
      await browser.openKeeperPopup();
    });

    beforeEach(async function () {
      const assetCard = await HomeScreen.getAssetByName('WAVES');
      await assetCard.moreButton.moveTo();
      await assetCard.clickButton.click();
    });

    afterEach(async function () {
      await TransferTransactionScreen.rejectButton.click();
      await FinalTransactionScreen.closeButton.click();
    });

    it('Send WAVES to an address', async function () {
      await SendAssetScreen.recipientInput.setValue(
        '3MsX9C2MzzxE4ySF5aYcJoaiPfkyxZMg4cW'
      );
      await SendAssetScreen.amountInput.setValue('123123123.123');

      expect(await SendAssetScreen.amountInput.getValue()).toBe(
        '123 123 123.123'
      );

      await SendAssetScreen.amountInput.clearValue();
      await SendAssetScreen.amountInput.setValue('0.123');

      await SendAssetScreen.attachmentInput.setValue('This is an attachment');

      await SendAssetScreen.submitButton.click();

      expect(TransferTransactionScreen.transferAmount).toHaveText(
        '-0.12300000 WAVES'
      );
      expect(TransferTransactionScreen.recipient).toHaveText(
        'rich\n3MsX9C2M...yxZMg4cW'
      );
      expect(TransferTransactionScreen.attachmentContent).toHaveText(
        'This is an attachment'
      );
    });

    it('Send assets to an alias', async function () {
      await SendAssetScreen.recipientInput.setValue('alias:T:an_alias');
      await SendAssetScreen.amountInput.setValue('0.87654321');
      await SendAssetScreen.attachmentInput.setValue('This is an attachment');
      await SendAssetScreen.submitButton.click();

      expect(TransferTransactionScreen.transferAmount).toHaveText(
        '-0.87654321 WAVES'
      );
      expect(TransferTransactionScreen.recipient).toHaveText(
        'alias:T:an_alias'
      );
      expect(TransferTransactionScreen.attachmentContent).toHaveText(
        'This is an attachment'
      );
    });
  });

  describe('Connection', () => {
    async function stopServiceWorker() {
      await browser.navigateTo('chrome://serviceworker-internals');
      await browser.$('.content .stop').click();
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

      expect(EmptyHomeScreen.root).toBeDisabled();

      await browser.createWindow('tab');

      const newTab = await browser.getWindowHandle();
      await browser.switchToWindow(tabAccounts);
      await browser.closeWindow();
      await browser.switchToWindow(newTab);
    });

    it('contentscript waits until connection is established before trying to call methods', async function () {
      await browser.navigateTo('https://example.com');

      const prevHandle = await browser.getWindowHandle();
      await browser.switchToWindow('tab');
      await stopServiceWorker();
      await browser.closeWindow();
      await browser.switchToWindow(prevHandle);

      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.execute(() => {
        KeeperWallet.auth({ data: 'hello' });
      });
      const [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();

      expect(CommonTransaction.originAddress).toHaveText('example.com');
      expect(CommonTransaction.accountName).toHaveText('rich');
      expect(CommonTransaction.originNetwork).toHaveText('Testnet');

      await CommonTransaction.rejectButton.click();
      await FinalTransactionScreen.closeButton.click();

      await Windows.waitForWindowToClose(messageWindow);
      await browser.switchToWindow(prevHandle);
      await browser.refresh();
    });
  });
});
