/**
 * Basic actions for tests.
 *
 * NOTE: Each of them needs to bind `this` from test.
 */
import { seedUtils } from '@waves/waves-transactions';
import * as mocha from 'mocha';
import { By, until, WebElement } from 'selenium-webdriver';
import { DEFAULT_ANIMATION_DELAY, DEFAULT_PASSWORD } from './constants';
import { expect } from 'chai';

interface VaultEntry {
  seed: string;
  publicKey: string;
  address: string;
  networkCode: string;
  network: string;
  type: string;
  name: string;
}

export const App = {
  initVault: async function (
    this: mocha.Context,
    password: string = DEFAULT_PASSWORD
  ) {
    await App.open.call(this);

    const tabKeeper = await this.driver.getWindowHandle();
    await this.driver.wait(
      async () => (await this.driver.getAllWindowHandles()).length === 2,
      this.wait
    );
    for (const handle of await this.driver.getAllWindowHandles()) {
      if (handle !== tabKeeper) {
        await this.driver.switchTo().window(handle);
        await this.driver.navigate().refresh();
        break;
      }
    }
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
      .wait(
        until.elementLocated(By.css('.app input#first[type=password]')),
        this.wait
      )
      .sendKeys(password);
    await this.driver
      .findElement(By.css('.app input#second[type=password]'))
      .sendKeys(password);
    await this.driver
      .findElement(By.css('.app input#termsAccepted[type=checkbox]'))
      .click();
    await this.driver
      .findElement(By.css('.app input#conditionsAccepted[type=checkbox]'))
      .click();
    await this.driver
      .wait(
        until.elementIsEnabled(
          this.driver.findElement(By.css('.app button[type=submit]'))
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

  resetVault: async function (this: mocha.Context) {
    await App.open.call(this);

    await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-menu-settingsIcon')]")
        ),
        this.wait
      )
      .click();

    await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-settings-deleteAccounts')]")
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

  decryptVault: async function (
    this: mocha.Context,
    password = DEFAULT_PASSWORD
  ) {
    const encryptedVault = await this.driver.executeAsyncScript<string>(
      function () {
        const cb = arguments[arguments.length - 1];

        chrome.storage.local.get('WalletController', storage =>
          cb(storage.WalletController.vault)
        );
      }
    );

    const vault: VaultEntry[] = JSON.parse(
      seedUtils.decryptSeed(encryptedVault, password)
    );

    return vault;
  },

  open: async function (this: mocha.Context) {
    await this.driver.get(this.extensionUrl);
    await this.driver.wait(
      until.elementIsVisible(
        this.driver.wait(until.elementLocated(By.css('.app')), this.wait)
      ),
      this.wait
    );
  },
  closeBgTabs: async function (this: mocha.Context, foreground: string) {
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
  addAccount: async function (this: mocha.Context) {
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
  getActiveAccountName: async function (this: mocha.Context) {
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
  getOtherAccountNames: async function (this: mocha.Context) {
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
  getAllAccountNames: async function (this: mocha.Context) {
    return [
      await Assets.getActiveAccountName.call(this),
      ...(await Assets.getOtherAccountNames.call(this)),
    ];
  },
};

export const CreateNewAccount = {
  importAccount: async function (
    this: mocha.Context,
    name: string,
    seed: string
  ) {
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
  rootSettings: async function (this: mocha.Context) {
    await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-menu-settingsIcon')]")
        ),
        this.wait
      )
      .click();
  },
  generalSettings: async function (this: mocha.Context) {
    await Settings.rootSettings.call(this);
    await this.driver
      .wait(until.elementLocated(By.css('button#settingsGeneral')), this.wait)
      .click();
  },

  setSessionTimeout: async function (this: mocha.Context, index: number) {
    // refresh timeout by focus window
    await this.driver.executeScript(() => {
      window.focus();
    });

    await Settings.generalSettings.call(this);

    await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-index-selectInput')]")
        ),
        this.wait
      )
      .click();
    const position = index === -1 ? 'last()' : `position()=${index}`;

    await this.driver
      .wait(
        until.elementLocated(
          By.xpath(`//div[contains(@class, '-index-listItem-')][${position}]`)
        ),
        this.wait
      )
      .click();
  },

  setMinSessionTimeout: async function (this: mocha.Context) {
    const FIRST = 1;
    await Settings.setSessionTimeout.call(this, FIRST);
  },

  setMaxSessionTimeout: async function (this: mocha.Context) {
    const LAST = -1;
    await Settings.setSessionTimeout.call(this, LAST);
  },

  permissionSettings: async function (this: mocha.Context) {
    await Settings.rootSettings.call(this);
    await this.driver
      .wait(
        until.elementLocated(By.css('button#settingsPermission')),
        this.wait
      )
      .click();
  },

  clearCustomList: async function (this: mocha.Context) {
    await Settings.permissionSettings.call(this);

    for (const originEl of await this.driver.findElements(
      By.xpath("//div[contains(@class, '-list-permissionItem')]")
    )) {
      await originEl
        .findElement(By.xpath("//button[contains(@class, '-list-settings')]"))
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
  switchTo: async function (this: mocha.Context, network: string) {
    await this.driver
      .wait(
        until.elementIsVisible(
          this.driver.wait(
            until.elementLocated(
              By.xpath("//i[contains(@class, '-network-networkIcon')]")
            ),
            this.wait
          )
        ),
        this.wait
      )
      .click();

    await this.driver.executeScript(
      el => el.click(),
      await this.driver.wait(
        until.elementLocated(
          By.xpath(
            `//div[contains(@class, '-network-chooseNetwork')][contains(text(), '${network}')]` +
              "//i[contains(@class, '-network-networkIcon')]"
          )
        ),
        this.wait
      )
    );
  },
  checkNetwork: async function (this: mocha.Context, network: string) {
    await this.driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@class, '-intro-loader')]")
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
              "//div[contains(@class, '-network-network')]" +
                "//span[contains(@class, 'network-networkBottom')]"
            )
          ),
          this.wait
        )
        .getText()
    ).matches(new RegExp(network, 'i'));
  },
  switchToAndCheck: async function (this: mocha.Context, network: string) {
    await Network.switchTo.call(this, network);
    await Network.checkNetwork.call(this, network);
  },
};
