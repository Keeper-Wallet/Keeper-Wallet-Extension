import * as mocha from 'mocha';
import { By, until } from 'selenium-webdriver';

import { App, Assets, Windows } from './utils/actions';
import { DEFAULT_PASSWORD } from './utils/constants';

describe('Tabs manipulation', function () {
  let tabKeeper: string, tabAccounts: string;

  after(async function () {
    await App.open.call(this);
    await App.resetVault.call(this);
  });

  describe('vault is empty', function () {
    after(async function () {
      await App.closeBgTabs.call(this, tabKeeper);
    });

    it('new "accounts" appears when opened "popup"', async function () {
      tabKeeper = await this.driver.getWindowHandle();
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await App.open.call(this);

      [tabAccounts] = await waitForNewWindows(1);
      await this.driver.switchTo().window(tabAccounts);
      await this.driver.navigate().refresh();
    });

    it('no more tabs appears when opened "popup" again', async function () {
      await this.driver.switchTo().window(tabKeeper);
      await this.driver.navigate().refresh();

      await this.driver.wait(
        async () => (await this.driver.getAllWindowHandles()).length === 2,
        this.wait
      );
    });

    it('import form appears in "accounts" after password entered', async function () {
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
        .sendKeys(DEFAULT_PASSWORD);
      await this.driver
        .findElement(By.css('#second'))
        .sendKeys(DEFAULT_PASSWORD);
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
        until.elementLocated(
          By.css(
            '[data-testid="importForm"] [data-testid="createNewAccountBtn"]'
          )
        ),
        this.wait
      );
    });
  });

  describe('vault initialized', function () {
    after(async function () {
      await App.closeBgTabs.call(this, tabKeeper);
    });

    it('"add account" button appears in "popup" when password entered', async function () {
      await this.driver.wait(
        until.elementIsVisible(
          this.driver.wait(
            until.elementLocated(By.css('[data-testid="addAccountBtn"]')),
            this.wait
          )
        ),
        this.wait
      );
    });

    it('new "accounts" appears when click "add account" button in "popup"', async function () {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      tabKeeper = await this.driver.getWindowHandle();
      await this.driver
        .findElement(By.css('[data-testid="addAccountBtn"]'))
        .click();
      [tabAccounts] = await waitForNewWindows(1);

      await this.driver.switchTo().window(tabAccounts);
      await this.driver.navigate().refresh();
    });

    it('no more tabs appears when click "add account" button in "popup" again', async function () {
      await this.driver.switchTo().window(tabKeeper);
      await this.driver.navigate().refresh();

      await this.driver.wait(
        async () => (await this.driver.getAllWindowHandles()).length === 2,
        this.wait
      );
    });

    async function importAccountUntilSuccess(
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
    }

    it('success form displayed when import is done', async function () {
      await this.driver.switchTo().window(tabAccounts);
      await this.driver.navigate().refresh();

      await importAccountUntilSuccess.call(
        this,
        'rich',
        'waves private node seed with waves tokens'
      );

      await this.driver.wait(
        until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
        this.wait
      );
    });

    it('import form displays after "add another account" button click', async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="addAnotherAccountBtn"]')),
          this.wait
        )
        .click();

      await this.driver.wait(
        until.elementLocated(By.css('[data-testid="importForm"]')),
        this.wait
      );
    });

    it('"finish" button closes "accounts" tab', async function () {
      await importAccountUntilSuccess.call(
        this,
        'poor',
        'waves private node seed without waves tokens'
      );

      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
          this.wait
        )
        .findElement(By.css('[data-testid="finishBtn"]'))
        .click();

      await this.driver.wait(
        async () => (await this.driver.getAllWindowHandles()).length === 1,
        this.wait
      );
    });

    it('"accounts" appears when add another account from "popup"', async function () {
      await this.driver.switchTo().window(tabKeeper);

      await Assets.addAccount.call(this);

      await this.driver.wait(
        async () => (await this.driver.getAllWindowHandles()).length === 2,
        this.wait
      );
    });

    it('no more tabs appears when add another account from "popup" again', async function () {
      await this.driver.switchTo().window(tabKeeper);

      await Assets.addAccount.call(this);

      await this.driver.wait(
        async () => (await this.driver.getAllWindowHandles()).length === 2,
        this.wait
      );
    });
  });
});
