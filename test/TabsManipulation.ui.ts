import { App, Assets, Windows } from '../test/utils/actions';
import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { DEFAULT_PASSWORD } from './utils/constants';
import * as mocha from 'mocha';

describe('Tabs manipulation', function () {
  this.timeout(60 * 1000);

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

      expect(
        await this.driver.wait(
          async () => (await this.driver.getAllWindowHandles()).length === 3,
          this.wait
        )
      ).not.to.be.throw;
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
        .wait(
          until.elementLocated(By.css('.app input#first[type=password]')),
          this.wait
        )
        .sendKeys(DEFAULT_PASSWORD);
      await this.driver
        .findElement(By.css('.app input#second[type=password]'))
        .sendKeys(DEFAULT_PASSWORD);
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

      expect(
        await this.driver.wait(
          until.elementLocated(
            By.css(
              '[data-testid="importForm"] [data-testid="createNewAccountBtn"]'
            )
          ),
          this.wait
        )
      ).not.to.be.throw;
    });
  });

  describe('vault initialized', function () {
    after(async function () {
      await App.closeBgTabs.call(this, tabKeeper);
    });

    it('"add account" button appears in "popup" when password entered', async function () {
      expect(
        await this.driver.wait(
          until.elementIsVisible(
            this.driver.wait(
              until.elementLocated(By.css('[data-testid="addAccountBtn"]')),
              this.wait
            )
          ),
          this.wait
        )
      ).not.to.be.throw;
    });

    it('new "accounts" appears when click "add account" button in "popup"', async function () {
      await this.driver
        .findElement(By.css('[data-testid="addAccountBtn"]'))
        .click();

      const handles = await this.driver.getAllWindowHandles();
      tabKeeper = handles[0];

      expect(
        await this.driver.wait(
          async () => (await this.driver.getAllWindowHandles()).length === 3,
          this.wait
        )
      ).not.to.be.throw;

      for (const handle of await this.driver.getAllWindowHandles()) {
        if (handle !== tabKeeper && handle !== this.serviceWorkerTab) {
          tabAccounts = handle;
          await this.driver.switchTo().window(handle);
          await this.driver.navigate().refresh();
          break;
        }
      }

      expect(tabAccounts).not.to.be.empty;
    });

    it('no more tabs appears when click "add account" button in "popup" again', async function () {
      await this.driver.switchTo().window(tabKeeper);
      await this.driver.navigate().refresh();

      expect(
        await this.driver.wait(
          async () => (await this.driver.getAllWindowHandles()).length === 3,
          this.wait
        )
      ).not.to.be.throw;
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

      expect(
        await this.driver.wait(
          until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
          this.wait
        )
      ).not.to.be.throw;
    });

    it('import form displays after "add another account" button click', async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="addAnotherAccountBtn"]')),
          this.wait
        )
        .click();

      expect(
        await this.driver.wait(
          until.elementLocated(By.css('[data-testid="importForm"]')),
          this.wait
        )
      ).not.to.be.throw;
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

      expect(
        await this.driver.wait(
          async () => (await this.driver.getAllWindowHandles()).length === 2,
          this.wait
        )
      ).not.to.be.throw;
    });

    it('"accounts" appears when add another account from "popup"', async function () {
      await this.driver.switchTo().window(tabKeeper);

      await Assets.addAccount.call(this);

      expect(
        await this.driver.wait(
          async () => (await this.driver.getAllWindowHandles()).length === 3,
          this.wait
        )
      ).not.to.be.throw;
    });

    it('no more tabs appears when add another account from "popup" again', async function () {
      await this.driver.switchTo().window(tabKeeper);

      await Assets.addAccount.call(this);

      expect(
        await this.driver.wait(
          async () => (await this.driver.getAllWindowHandles()).length === 3,
          this.wait
        )
      ).not.to.be.throw;
    });
  });
});
