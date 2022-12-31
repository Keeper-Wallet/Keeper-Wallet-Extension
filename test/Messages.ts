import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';

import {
  App,
  ContentScript,
  CreateNewAccount,
  Settings,
  Windows,
} from './utils/actions';
import {
  CUSTOMLIST,
  DEFAULT_PAGE_LOAD_DELAY,
  WHITELIST,
} from './utils/constants';

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
    await App.initVault.call(this);
    const tabKeeper = await this.driver.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="addAccountBtn"]')),
        this.wait
      )
      .click();
    const [tabAccounts] = await waitForNewWindows(1);

    await this.driver.switchTo().window(tabKeeper);
    await this.driver.close();

    await this.driver.switchTo().window(tabAccounts);
    await this.driver.navigate().refresh();

    await CreateNewAccount.importAccount.call(
      this,
      'rich',
      'waves private node seed with waves tokens'
    );

    await this.driver.switchTo().newWindow('tab');
    tabOrigin = await this.driver.getWindowHandle();

    await this.driver.switchTo().window(tabAccounts);
    await this.driver.close();
    await this.driver.switchTo().window(tabOrigin);
  });

  after(async function () {
    const tabKeeper = await this.driver.getWindowHandle();
    await App.open.call(this);
    await Settings.clearCustomList.call(this);
    await App.closeBgTabs.call(this, tabKeeper);
    await App.resetVault.call(this);
  });

  it('Allowed messages from all resources from WhiteList', async function () {
    for (const origin of WHITELIST) {
      await this.driver.get(`https://${origin}`);

      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await ContentScript.waitForKeeperWallet.call(this);
      await this.driver.executeAsyncScript(sendNotification);
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();

      expect(
        await this.driver
          .wait(
            until.elementLocated(
              By.xpath(
                "//div[contains(@class, 'messageList@activeNotification')]"
              )
            ),
            this.wait
          )
          .findElements(
            By.xpath(
              "//div[contains(@class, 'messageItemInner@activeNotification')]"
            )
          )
      ).not.to.be.empty;

      await this.driver.findElement(By.css('#closeNotification')).click();
      await Windows.waitForWindowToClose.call(this, messageWindow);
      messageWindow = null;
      await this.driver.switchTo().window(tabOrigin);
    }
  });

  it('When a message is received from a new resource, permission is requested to access', async function () {
    await this.driver.get(`https://${CUSTOMLIST[0]}`);

    const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
    await ContentScript.waitForKeeperWallet.call(this);
    await this.driver.executeScript(sendNotification);
    [messageWindow] = await waitForNewWindows(1);
    await this.driver.switchTo().window(messageWindow);
    await this.driver.navigate().refresh();

    // permission request is shown
    await this.driver.wait(
      until.elementLocated(
        By.xpath("//details[contains(@class, 'permissionsDetails@authOrigin')]")
      ),
      this.wait
    );
  });

  it('When allowing access to messages - the message is instantly displayed', async function () {
    // expand permission settings
    await this.driver
      .findElement(
        By.xpath("//summary[contains(@class, 'permissionsSummary@authOrigin')]")
      )
      .click();

    await this.driver
      .wait(
        until.elementIsVisible(
          this.driver.findElement(By.css('#checkbox_noshow'))
        ),
        this.wait
      )
      .click();

    await this.driver.findElement(By.css('#approve')).click();

    expect(
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath(
              "//div[contains(@class, 'messageList@activeNotification')]"
            )
          ),
          this.wait
        )
        .findElements(
          By.xpath(
            "//div[contains(@class, 'messageItemInner@activeNotification')]"
          )
        )
    ).not.to.be.empty;

    await this.driver.findElement(By.css('#closeNotification')).click();
    expect(messageWindow).not.to.be.null;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await Windows.waitForWindowToClose.call(this, messageWindow!);
    messageWindow = null;
    await this.driver.switchTo().window(tabOrigin);
  });

  it('When allowing access to an application, but denying messages - messages are not displayed', async function () {
    await this.driver.get(`https://${CUSTOMLIST[1]}`);

    const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
    await ContentScript.waitForKeeperWallet.call(this);
    await this.driver.executeScript(sendNotification);
    [messageWindow] = await waitForNewWindows(1);
    await this.driver.switchTo().window(messageWindow);
    await this.driver.navigate().refresh();

    // permission request is shown
    await this.driver.wait(
      until.elementLocated(
        By.xpath("//details[contains(@class, 'permissionsDetails@authOrigin')]")
      ),
      this.wait
    );

    await this.driver
      .wait(
        until.elementIsEnabled(this.driver.findElement(By.css('#approve'))),
        this.wait
      )
      .click();

    await this.driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@class, 'transaction@transactions')]")
      ),
      this.wait
    );

    await this.driver.findElement(By.css('#close')).click();
    await Windows.waitForWindowToClose.call(this, messageWindow);
    messageWindow = null;
    await this.driver.switchTo().window(tabOrigin);
  });

  it('When allowing access from settings - messages are displayed', async function () {
    await App.open.call(this);

    await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, 'settingsIcon@menu')]")
        ),
        this.wait
      )
      .click();

    await this.driver
      .wait(until.elementLocated(By.css('#settingsPermission')), this.wait)
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

    await this.driver.findElement(By.css('#save')).click();

    await this.driver.get(`https://${CUSTOMLIST[1]}`);

    const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
    await ContentScript.waitForKeeperWallet.call(this);
    await this.driver.executeAsyncScript(sendNotification);
    [messageWindow] = await waitForNewWindows(1);
    await this.driver.switchTo().window(messageWindow);
    await this.driver.navigate().refresh();

    expect(
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath(
              "//div[contains(@class, 'messageList@activeNotification')]"
            )
          ),
          this.wait
        )
        .findElements(
          By.xpath(
            "//div[contains(@class, 'messageItemInner@activeNotification')]"
          )
        )
    ).not.to.be.empty;

    await this.driver.findElement(By.css('#closeNotification')).click();
    await Windows.waitForWindowToClose.call(this, messageWindow);
    messageWindow = null;
    await this.driver.switchTo().window(tabOrigin);
  });

  it('When receiving several messages from one resource - messages are displayed as a "batch"', async function () {
    await this.driver.get(`https://${WHITELIST[3]}`);

    const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
    for (let success = 0; success < 2; ) {
      await ContentScript.waitForKeeperWallet.call(this);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await this.driver.executeAsyncScript<any>(
        sendNotification
      );

      if (result?.code === '18') {
        await this.driver.sleep(5 * 1000);
      } else {
        success++;
      }
    }
    [messageWindow] = await waitForNewWindows(1);
    await this.driver.switchTo().window(messageWindow);
    await this.driver.navigate().refresh();

    expect(
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath(
              "//div[contains(@class, 'messageList@activeNotification')]"
            )
          ),
          this.wait
        )
        .findElements(
          By.xpath(
            "//div[contains(@class, 'messageItemInner@activeNotification')]"
          )
        )
    ).length(2);
    // do not clear messages for next test
  });

  it('When receiving messages from several resources - messages are displayed in several blocks', async function () {
    await this.driver.switchTo().window(tabOrigin);
    await this.driver.get(`https://${WHITELIST[4]}`);

    await ContentScript.waitForKeeperWallet.call(this);
    await this.driver.executeAsyncScript(sendNotification);
    expect(messageWindow).not.to.be.null;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.driver.switchTo().window(messageWindow!);
    await this.driver.navigate().refresh();

    expect(
      await this.driver.wait(
        until.elementsLocated(
          By.xpath(
            "//div[contains(@class, 'cardItem@messagesAndNotifications')]"
          )
        ),
        this.wait
      )
    ).length(2);
    // do not clear messages for next test
  });

  it('The "Clear all" button closes all messages', async function () {
    await this.driver.findElement(By.css('#clearAllMessages')).click();
    await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);

    expect(
      await this.driver.findElements(
        By.xpath(
          "//div[contains(@class, 'messageList@activeNotification')]" +
            "//div[contains(@class, 'cardItem@activeNotification')]"
        )
      )
    ).to.be.empty;

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
