import { expect } from 'chai';
import * as mocha from 'mocha';
import { By, until, WebElement } from 'selenium-webdriver';

import {
  DEFAULT_ANIMATION_DELAY,
  DEFAULT_PASSWORD,
  DEFAULT_SWITCH_NETWORK_DELAY,
} from './constants';

export const App = {
  async initVault(this: mocha.Context, password: string = DEFAULT_PASSWORD) {
    const tabKeeper = await this.driver.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
    await App.open.call(this);
    const [tabAccounts] = await waitForNewWindows(1);

    await this.driver.switchTo().window(tabAccounts);
    await this.driver.navigate().refresh();

    await this.driver
      .wait(
        until.elementIsVisible(
          await this.driver.wait(
            until.elementLocated(By.css('[data-testid="getStartedBtn"]')),
            this.wait
          )
        ),
        this.wait
      )
      .click();

    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="newAccountForm"]')),
      this.wait
    );
    await this.driver
      .wait(until.elementLocated(By.css('#first')), this.wait)
      .sendKeys(password);
    await this.driver.findElement(By.css('#second')).sendKeys(password);
    await this.driver.findElement(By.css('#termsAccepted')).click();
    await this.driver.findElement(By.css('#conditionsAccepted')).click();
    await this.driver
      .wait(
        until.elementIsEnabled(
          this.driver.findElement(By.css('button[type=submit]'))
        ),
        this.wait
      )
      .click();
    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="importForm"]')),
      this.wait
    );

    await this.driver.close();
    await this.driver.switchTo().window(tabKeeper);
  },

  async resetVault(this: mocha.Context) {
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
      .wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, 'deleteAccounts@settings')]")
        ),
        this.wait
      )
      .click();

    const form = this.driver.wait(
      until.elementLocated(By.css('[data-testid="deleteAllAccounts"]')),
      this.wait
    );

    const defaultPhrase = await form
      .findElement(By.css('[data-testid="defaultPhrase"]'))
      .getText();

    await form
      .findElement(By.css('[data-testid="confirmPhrase"]'))
      .sendKeys(defaultPhrase);

    await this.driver
      .wait(
        until.elementIsEnabled(
          form.findElement(By.css('[data-testid="resetConfirm"]'))
        ),
        this.wait
      )
      .click();
  },

  async open(this: mocha.Context) {
    await this.driver.get(this.extensionUrl);
  },

  async closeBgTabs(this: mocha.Context, foreground: string) {
    for (const handle of await this.driver.getAllWindowHandles()) {
      if (handle !== foreground) {
        await this.driver.switchTo().window(handle);
        await this.driver.close();
      }
    }
    await this.driver.switchTo().window(foreground);
  },
};

export const Assets = {
  async addAccount(this: mocha.Context) {
    await this.driver.sleep(DEFAULT_ANIMATION_DELAY);

    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="otherAccountsButton"]')),
        this.wait
      )
      .click();

    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="addAccountButton"]')),
        this.wait
      )
      .click();
  },
  async getActiveAccountName(this: mocha.Context) {
    return this.driver
      .wait(
        until.elementLocated(
          By.css(
            '[data-testid="activeAccountCard"] [data-testid="accountName"]'
          )
        ),
        this.wait,
        'Could not get active account name'
      )
      .getText();
  },
  async getOtherAccountNames(this: mocha.Context) {
    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="otherAccountsButton"]')),
        this.wait
      )
      .click();

    const accountNameElements = await this.driver
      .wait(
        until.elementsLocated(
          By.css('[data-testid="accountCard"] [data-testid="accountName"]')
        ),
        500
      )
      .catch((): WebElement[] => []);

    const accountNames = await Promise.all(
      accountNameElements.map(accName => accName.getText())
    );

    await this.driver.findElement(By.css('div.arrow-back-icon')).click();

    return accountNames;
  },
  async getAllAccountNames(this: mocha.Context) {
    return [
      await Assets.getActiveAccountName.call(this),
      ...(await Assets.getOtherAccountNames.call(this)),
    ];
  },
};

export const CreateNewAccount = {
  async importAccount(this: mocha.Context, name: string, seed: string) {
    await this.driver
      .wait(
        until.elementIsVisible(
          await this.driver.wait(
            until.elementLocated(By.css('[data-testid="importSeed"]')),
            this.wait
          )
        ),
        this.wait
      )
      .click();

    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="seedInput"]')),
        this.wait
      )
      .sendKeys(seed);
    await this.driver
      .wait(
        until.elementIsEnabled(
          this.driver.findElement(By.css('[data-testid="continueBtn"]'))
        ),
        this.wait
      )
      .click();

    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="newAccountNameInput"]')),
        this.wait
      )
      .sendKeys(name);
    await this.driver
      .wait(
        until.elementIsEnabled(
          this.driver.findElement(By.css('[data-testid="continueBtn"]'))
        ),
        this.wait
      )
      .click();

    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
        this.wait
      )
      .findElement(By.css('[data-testid="addAnotherAccountBtn"]'))
      .click();

    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="importForm"]')),
      this.wait
    );
  },
};

export const Settings = {
  async rootSettings(this: mocha.Context) {
    await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, 'settingsIcon@menu')]")
        ),
        this.wait
      )
      .click();
  },
  async generalSettings(this: mocha.Context) {
    await Settings.rootSettings.call(this);
    await this.driver
      .wait(until.elementLocated(By.css('button#settingsGeneral')), this.wait)
      .click();
  },

  async setSessionTimeout(this: mocha.Context, index: number) {
    // refresh timeout by focus window
    await this.driver.executeScript(() => {
      window.focus();
    });

    await Settings.generalSettings.call(this);

    await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, 'trigger@Select-module')]")
        ),
        this.wait
      )
      .click();
    const position = index === -1 ? 'last()' : `position()=${index}`;

    await this.driver
      .wait(
        until.elementLocated(
          By.xpath(`//div[contains(@class, 'item@Select-module')][${position}]`)
        ),
        this.wait
      )
      .click();
  },

  async setMinSessionTimeout(this: mocha.Context) {
    const FIRST = 1;
    await Settings.setSessionTimeout.call(this, FIRST);
  },

  async setMaxSessionTimeout(this: mocha.Context) {
    const LAST = -1;
    await Settings.setSessionTimeout.call(this, LAST);
  },

  async permissionSettings(this: mocha.Context) {
    await Settings.rootSettings.call(this);
    await this.driver
      .wait(
        until.elementLocated(By.css('button#settingsPermission')),
        this.wait
      )
      .click();
  },

  async clearCustomList(this: mocha.Context) {
    await Settings.permissionSettings.call(this);

    for (const originEl of await this.driver.findElements(
      By.xpath("//div[contains(@class, 'permissionItem@list')]")
    )) {
      await originEl
        .findElement(By.xpath("//button[contains(@class, 'settings@list')]"))
        .click();

      const originSettingsModal = this.driver.wait(
        until.elementLocated(By.css('div#originSettings')),
        this.wait
      );
      await this.driver.wait(
        until.elementIsVisible(originSettingsModal),
        this.wait
      );
      this.driver.findElement(By.css('button#delete')).click();
      await this.driver.sleep(DEFAULT_ANIMATION_DELAY);
    }
  },
};

export const Network = {
  async switchTo(this: mocha.Context, network: string) {
    await this.driver.sleep(DEFAULT_SWITCH_NETWORK_DELAY);

    await this.driver
      .wait(
        until.elementIsVisible(
          this.driver.wait(
            until.elementLocated(
              By.xpath("//i[contains(@class, 'networkIcon@network')]")
            ),
            this.wait
          )
        ),
        this.wait
      )
      .click();

    await this.driver.executeScript(
      (el: HTMLElement) => el.click(),
      await this.driver.wait(
        until.elementLocated(
          By.xpath(
            `//div[contains(@class, 'chooseNetwork@network')][contains(text(), '${network}')]` +
              "//i[contains(@class, 'networkIcon@network')]"
          )
        ),
        this.wait
      )
    );
  },
  async checkNetwork(this: mocha.Context, network: string) {
    await this.driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@class, 'root@loadingScreen-module')]")
      ),
      this.wait
    );

    await this.driver.wait(
      until.elementLocated(
        By.css('[data-testid="importForm"], [data-testid="assetsForm"]')
      ),
      this.wait
    );

    expect(
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath(
              "//div[contains(@class, 'network@network')]" +
                "//span[contains(@class, 'networkBottom@network')]"
            )
          ),
          this.wait
        )
        .getText()
    ).matches(new RegExp(network, 'i'));
  },
  async switchToAndCheck(this: mocha.Context, network: string) {
    await Network.switchTo.call(this, network);
    await Network.checkNetwork.call(this, network);
  },
};

export const Windows = {
  async captureNewWindows(this: mocha.Context) {
    const prevHandlesSet = new Set(await this.driver.getAllWindowHandles());

    return {
      waitForNewWindows: async (count: number) => {
        let newHandles: string[] = [];

        await this.driver.wait(
          async () => {
            const handles = await this.driver.getAllWindowHandles();

            newHandles = handles.filter(handle => !prevHandlesSet.has(handle));

            return newHandles.length >= count;
          },
          this.wait,
          'waiting for new windows to appear'
        );

        return newHandles;
      },
    };
  },
  async waitForWindowToClose(this: mocha.Context, windowHandle: string) {
    await this.driver.wait(
      async () => {
        const handles = await this.driver.getAllWindowHandles();

        return !handles.includes(windowHandle);
      },
      this.wait,
      'waiting for window to close'
    );
  },
};
