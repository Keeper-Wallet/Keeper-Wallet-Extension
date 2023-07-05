import waitForExpect from 'wait-for-expect';

import { ContentScript } from './helpers/ContentScript';
import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { Settings } from './helpers/flows/Settings';
import { HomeScreen } from './helpers/HomeScreen';
import { AuthMessageScreen } from './helpers/messages/AuthMessageScreen';
import { FinalTransactionScreen } from './helpers/messages/FinalTransactionScreen';
import { MessagesScreen } from './helpers/MessagesScreen';
import { PermissionControlSettingsScreen } from './helpers/settings/PermissionControlSettingsScreen';
import { SettingsMenuScreen } from './helpers/settings/SettingsMenuScreen';
import { TopMenu } from './helpers/TopMenu';
import { Windows } from './helpers/Windows';
import { CUSTOMLIST, WHITELIST } from './utils/constants';

describe('Messages', function () {
  let tabOrigin: string;
  let messageWindow: string | null = null;

  const sendNotification = (...args: [done: () => void]) => {
    const done = args[args.length - 1];

    KeeperWallet.notification({ title: 'Hello!', message: 'World!' })
      .then(done)
      .catch(done);
  };

  const sendNotificationWithoutWait = (...args: [done: () => void]) => {
    const done = args[args.length - 1];

    KeeperWallet.notification({ title: 'Hello!', message: 'World!' });
    done();
  };

  before(async function () {
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
      'rich',
      'waves private node seed with waves tokens',
    );

    tabOrigin = (await browser.createWindow('tab')).handle;

    await browser.switchToWindow(tabAccounts);
    await browser.closeWindow();
    await browser.switchToWindow(tabOrigin);
  });

  after(async function () {
    const tabKeeper = await browser.getWindowHandle();
    await browser.openKeeperPopup();
    await Settings.clearCustomList();
    await App.closeBgTabs(tabKeeper);
    await App.resetVault();
  });

  for (const origin of WHITELIST) {
    it(`Allowed messages from ${origin}`, async function () {
      await browser.navigateTo(`https://${origin}`);

      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();
      await browser.executeAsync(sendNotification);
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();

      await waitForExpect(async () => {
        expect(await MessagesScreen.messages).not.toHaveLength(0);
      });
      await MessagesScreen.closeButton.click();
      await Windows.waitForWindowToClose(messageWindow);
      messageWindow = null;
      await browser.switchToWindow(tabOrigin);
    });
  }

  it('When a message is received from a new resource, permission is requested to access', async function () {
    await browser.navigateTo(`https://${CUSTOMLIST[0]}`);

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await ContentScript.waitForKeeperWallet();
    await browser.executeAsync(sendNotificationWithoutWait);
    [messageWindow] = await waitForNewWindows(1);
    await browser.switchToWindow(messageWindow);
    await browser.refresh();

    await expect(AuthMessageScreen.root).toBeDisplayed();
  });

  it('When allowing access to messages - the message is instantly displayed', async function () {
    await AuthMessageScreen.permissionDetailsButton.click();
    await AuthMessageScreen.allowMessagesCheckbox.click();
    await AuthMessageScreen.authButton.click();

    expect(await MessagesScreen.messages).not.toHaveLength(0);

    await MessagesScreen.closeButton.click();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await Windows.waitForWindowToClose(messageWindow!);
    messageWindow = null;
    await browser.switchToWindow(tabOrigin);
  });

  it('When allowing access to an application, but denying messages - messages are not displayed', async function () {
    await browser.navigateTo(`https://${CUSTOMLIST[1]}`);

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await ContentScript.waitForKeeperWallet();
    await browser.executeAsync(sendNotificationWithoutWait);
    [messageWindow] = await waitForNewWindows(1);
    await browser.switchToWindow(messageWindow);
    await browser.refresh();

    await AuthMessageScreen.permissionDetailsButton.click();
    await AuthMessageScreen.authButton.click();

    await expect(FinalTransactionScreen.transactionContent).toHaveText(
      'Request has been signed!',
    );

    await FinalTransactionScreen.closeButton.click();
    await Windows.waitForWindowToClose(messageWindow);
    messageWindow = null;
    await browser.switchToWindow(tabOrigin);
  });

  it('When allowing access from settings - messages are displayed', async function () {
    await browser.openKeeperPopup();

    await TopMenu.settingsButton.click();
    await SettingsMenuScreen.permissionsSectionLink.click();

    await (
      await PermissionControlSettingsScreen.getPermissionByOrigin(CUSTOMLIST[1])
    ).detailsIcon.click();
    await PermissionControlSettingsScreen.permissionDetailsModal.allowMessagesCheckbox.click();
    await PermissionControlSettingsScreen.permissionDetailsModal.saveButton.click();

    await browser.navigateTo(`https://${CUSTOMLIST[1]}`);

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await ContentScript.waitForKeeperWallet();
    await browser.executeAsync(sendNotification);
    [messageWindow] = await waitForNewWindows(1);
    await browser.switchToWindow(messageWindow);
    await browser.refresh();

    expect(await MessagesScreen.messages).not.toHaveLength(0);
    await MessagesScreen.closeButton.click();
    await Windows.waitForWindowToClose(messageWindow);
    messageWindow = null;
    await browser.switchToWindow(tabOrigin);
  });

  it('When receiving several messages from one resource - messages are displayed as a "batch"', async function () {
    await browser.navigateTo(`https://${WHITELIST[3]}`);

    const { waitForNewWindows } = await Windows.captureNewWindows();
    for (let success = 0; success < 2; ) {
      await ContentScript.waitForKeeperWallet();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await browser.executeAsync<any, []>(sendNotification);

      if (result?.code === '18') {
        await browser.pause(5 * 1000);
      } else {
        success++;
      }
    }
    [messageWindow] = await waitForNewWindows(1);
    await browser.switchToWindow(messageWindow);
    await browser.refresh();

    expect(await MessagesScreen.messages).toHaveLength(2);
    // do not clear messages for next test
  });

  it('When receiving messages from several resources - messages are displayed in several blocks', async function () {
    await browser.switchToWindow(tabOrigin);
    await browser.navigateTo(`https://${WHITELIST[4]}`);

    await ContentScript.waitForKeeperWallet();
    await browser.executeAsync(sendNotification);
    expect(messageWindow).not.toBeNull();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await browser.switchToWindow(messageWindow!);
    await browser.refresh();

    expect(await MessagesScreen.messagesCards).toHaveLength(2);
    // do not clear messages for next test
  });

  it('The "Clear all" button closes all messages', async function () {
    await MessagesScreen.clearAllButton.click();
    await expect(HomeScreen.root).toBeDisplayed();

    await browser.closeWindow();
    await browser.switchToWindow(tabOrigin);
  });

  // TODO looks like these units need to be checked in unittests
  it(
    'You cannot send messages from one resource more often than once every 30 seconds',
  );
  it('The message title cannot be longer than 20 characters');
  it('The message text cannot be longer than 250 characters');
  it('Title is a required field');
  it('Message is an optional field');
  it('Encrypting and decrypting messages');
});
