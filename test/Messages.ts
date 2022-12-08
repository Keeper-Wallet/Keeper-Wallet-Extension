import { expect } from 'expect-webdriverio';
import { By, until } from 'selenium-webdriver';

import { EmptyHomeScreen } from "./pageobject/EmptyHomeScreen";
import { AccountsHome, App, Settings, Windows } from './utils/actions';
import { CUSTOMLIST, DEFAULT_PAGE_LOAD_DELAY, WHITELIST, } from './utils/constants';

describe('Messages', function () {
  let tabOrigin: string;
  let messageWindow: string | null = null;

  const sendNotification = (...args: [done: () => void]) => {
    const done = args[args.length - 1];

    KeeperWallet.notification({ title: 'Hello!', message: 'World!' })
      .then(done)
      .catch(done);
  };

  before(async function () {
    await App.initVault();
    await Settings.setMaxSessionTimeout();
    await browser.openKeeperPopup();
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
      'waves private node seed with waves tokens'
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
    await App.closeBgTabs.call(this, tabKeeper);
    await App.resetVault();
  });

  it('Allowed messages from all resources from WhiteList', async function () {
    for (const origin of WHITELIST) {
      await this.driver.get(`https://${ origin }`);

      const { waitForNewWindows } = await Windows.captureNewWindows();
      await this.driver.executeAsyncScript(sendNotification);
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();

      expect(
        await this.driver
          .wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, 'messageList@messageList')]")
            ),
            this.wait
          )
          .findElements(
            By.xpath("//div[contains(@class, 'messageItemInner@messageList')]")
          )
      ).not.toHaveLength(0);

      await this.driver.findElement(By.css('button#closeNotification')).click();
      await Windows.waitForWindowToClose(messageWindow);
      messageWindow = null;
      await this.driver.switchTo().window(tabOrigin);
    }
  });

  it('When a message is received from a new resource, permission is requested to access', async function () {
    await this.driver.get(`https://${ CUSTOMLIST[0] }`);

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await this.driver.executeScript(sendNotification);
    [messageWindow] = await waitForNewWindows(1);
    await this.driver.switchTo().window(messageWindow);
    await this.driver.navigate().refresh();

    // permission request is shown
    await this.driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@class, 'transaction@originAuth')]")
      ),
      this.wait
    );
  });

  it('When allowing access to messages - the message is instantly displayed', async function () {
    // expand permission settings
    await this.driver
      .wait(
        until.elementIsVisible(
          this.driver.findElement(
            By.xpath(
              "//div[contains(@class, 'collapsed')]//div[contains(@class, 'title@index')]"
            )
          )
        ),
        this.wait
      )
      .click();

    await this.driver
      .wait(
        until.elementIsVisible(
          this.driver.findElement(By.css('input#checkbox_noshow'))
        ),
        this.wait
      )
      .click();

    await this.driver.findElement(By.css('button#approve')).click();

    expect(
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, 'messageList@messageList')]")
          ),
          this.wait
        )
        .findElements(
          By.xpath("//div[contains(@class, 'messageItemInner@messageList')]")
        )
    ).not.toHaveLength(0);

    await this.driver.findElement(By.css('button#closeNotification')).click();
    expect(messageWindow).not.toBeNull();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await Windows.waitForWindowToClose(messageWindow!);
    messageWindow = null;
    await this.driver.switchTo().window(tabOrigin);
  });

  it('When allowing access to an application, but denying messages - messages are not displayed', async function () {
    await this.driver.get(`https://${ CUSTOMLIST[1] }`);

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await this.driver.executeScript(sendNotification);
    [messageWindow] = await waitForNewWindows(1);
    await this.driver.switchTo().window(messageWindow);
    await this.driver.navigate().refresh();

    // permission request is shown
    await this.driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@class, 'transaction@originAuth')]")
      ),
      this.wait
    );
    await this.driver
      .wait(
        until.elementIsEnabled(
          this.driver.findElement(By.css('button#approve'))
        ),
        this.wait
      )
      .click();

    await this.driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@class, 'transaction@final')]")
      ),
      this.wait
    );

    await this.driver.findElement(By.css('button#close')).click();
    await Windows.waitForWindowToClose(messageWindow);
    messageWindow = null;
    await this.driver.switchTo().window(tabOrigin);
  });

  it('When allowing access from settings - messages are displayed', async function () {
    await browser.openKeeperPopup();

    await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, 'settingsIcon@menu')]")
        ),
        this.wait
      )
      .click();

    await this.driver
      .wait(
        until.elementLocated(By.css('button#settingsPermission')),
        this.wait
      )
      .click();

    await this.driver
      .wait(
        until.elementLocated(
          By.xpath(
            "//div[contains(@class, 'permissionItem@list')][last()]" +
            "//button[contains(@class, 'settings@list')]"
          )
        ),
        this.wait
      )
      .click();
    await this.driver
      .wait(until.elementLocated(By.css('input#checkbox_noshow')), this.wait)
      .click();

    await this.driver.findElement(By.css('button#save')).click();

    await this.driver.get(`https://${ CUSTOMLIST[1] }`);

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await this.driver.executeAsyncScript(sendNotification);
    [messageWindow] = await waitForNewWindows(1);
    await this.driver.switchTo().window(messageWindow);
    await this.driver.navigate().refresh();

    expect(
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, 'messageList@messageList')]")
          ),
          this.wait
        )
        .findElements(
          By.xpath("//div[contains(@class, 'messageItemInner@messageList')]")
        )
    ).not.toHaveLength(0);

    await this.driver.findElement(By.css('button#closeNotification')).click();
    await Windows.waitForWindowToClose(messageWindow);
    messageWindow = null;
    await this.driver.switchTo().window(tabOrigin);
  });

  it('When receiving several messages from one resource - messages are displayed as a "batch"', async function () {
    await this.driver.get(`https://${ WHITELIST[3] }`);

    const { waitForNewWindows } = await Windows.captureNewWindows();
    for (let success = 0; success < 2;) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await this.driver.executeAsyncScript<any>(
        sendNotification
      );

      if (result?.code !== '18') {
        success++;
      }

      await this.driver.sleep(5 * 1000);
    }
    [messageWindow] = await waitForNewWindows(1);
    await this.driver.switchTo().window(messageWindow);
    await this.driver.navigate().refresh();

    expect(
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, 'messageList@messageList')]")
          ),
          this.wait
        )
        .findElements(
          By.xpath("//div[contains(@class, 'messageItemInner@messageList')]")
        )
    ).toHaveLength(2);
    // do not clear messages for next test
  });

  it('When receiving messages from several resources - messages are displayed in several blocks', async function () {
    await this.driver.switchTo().window(tabOrigin);
    await this.driver.get(`https://${ WHITELIST[4] }`);

    await this.driver.executeAsyncScript(sendNotification);
    expect(messageWindow).not.toBeNull();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.driver.switchTo().window(messageWindow!);
    await this.driver.navigate().refresh();

    expect(
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, 'messageList@messageList')]")
          ),
          this.wait
        )
        .findElements(
          By.xpath("//div[contains(@class, 'cardItem@messageList')]")
        )
    ).toHaveLength(2);
    // do not clear messages for next test
  });

  it('The "Clear all" button closes all messages', async function () {
    await this.driver.findElement(By.css('button#clearAllMessages')).click();
    await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);

    expect(
      await this.driver.findElements(
        By.xpath(
          "//div[contains(@class, 'messageList@messageList')]" +
          "//div[contains(@class, 'cardItem@messageList')]"
        )
      )
    ).toHaveLength(0);

    await this.driver.close();
    await this.driver.switchTo().window(tabOrigin);
  });

  // TODO looks like these units need to be checked in unittests
  it(
    'You cannot send messages from one resource more often than once every 30 seconds'
  );
  it('The message title cannot be longer than 20 characters');
  it('The message text cannot be longer than 250 characters');
  it('Title is a required field');
  it('Message is an optional field');
  it('Encrypting and decrypting messages');
});
