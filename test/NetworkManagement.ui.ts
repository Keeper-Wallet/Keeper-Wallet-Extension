import { expect } from 'chai';
import { By, until, WebElement } from 'selenium-webdriver';

import { clear } from './utils';
import { AccountsHome, App, Network, Windows } from './utils/actions';
import { DEFAULT_ANIMATION_DELAY } from './utils/constants';

describe('Network management', function () {
  this.timeout(60 * 1000);

  let tabKeeper: string;

  before(async () => {
    await App.initVault();
  });

  after(async function () {
    await Network.switchToAndCheck('Mainnet');
    await App.closeBgTabs.call(this, tabKeeper);
    await App.resetVault();
  });

  describe('Switching networks', function () {
    it('Stagenet', async () => {
      await Network.switchToAndCheck('Stagenet');
    });

    it('Mainnet', async () => {
      await Network.switchToAndCheck('Mainnet');
    });

    describe('Testnet', function () {
      it('Successfully switched', async () => {
        await Network.switchToAndCheck('Testnet');
      });

      it('Imported testnet account starts with 3N or 3M', async function () {
        tabKeeper = await this.driver.getWindowHandle();

        const { waitForNewWindows } = await Windows.captureNewWindows();
        await this.driver
          .wait(
            until.elementLocated(By.css('[data-testid="addAccountBtn"]')),
            this.wait
          )
          .click();
        const [tabAccounts] = await waitForNewWindows(1);

        await this.driver.switchTo().window(tabAccounts);
        await this.driver.navigate().refresh();

        await AccountsHome.importAccount(
          'rich',
          'waves private node seed with waves tokens'
        );
        await this.driver.switchTo().window(tabKeeper);

        await this.driver
          .wait(
            until.elementLocated(By.css('[data-testid="activeAccountCard"]')),
            this.wait
          )
          .click();

        expect(
          await this.driver
            .wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, 'copyTextOverflow@copy')]")
              ),
              this.wait
            )
            .getText()
        ).to.be.matches(/^3[MN]/i);

        await this.driver.findElement(By.css('div.arrow-back-icon')).click();
        this.driver.wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, 'assets@assets')]")
          ),
          this.wait
        );
      });
    });

    describe('Custom', function () {
      const invalidNodeUrl = 'https://nodes.invalid.com';
      const customNetwork = 'Custom';

      it('Successfully switched', async function () {
        await Network.switchTo(customNetwork);

        await this.driver
          .wait(
            until.elementIsVisible(
              this.driver.wait(
                until.elementLocated(By.css('div#customNetwork')),
                this.wait
              )
            ),
            this.wait
          )
          .findElement(By.css('input#node_address'))
          .sendKeys(this.nodeUrl);

        await this.driver
          .findElement(By.css('button#networkSettingsSave'))
          .click();

        await Network.checkNetwork(customNetwork);
      });

      describe('Changing network settings by "Edit" button', function () {
        let nodeAddressInput: WebElement,
          nodeAddressError: WebElement,
          matcherAddressInput: WebElement,
          saveAndApplyBtn: WebElement;

        before(async function () {
          await this.driver
            .wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, 'editBtn@network')]")
              )
            )
            .click();

          await this.driver.wait(
            until.elementIsVisible(
              this.driver.wait(
                until.elementLocated(By.css('div#customNetwork')),
                this.wait
              )
            ),
            this.wait
          );

          nodeAddressInput = this.driver.findElement(
            By.css('input#node_address')
          );
          nodeAddressError = this.driver.findElement(
            By.css('[data-testid="nodeAddressError"]')
          );
          matcherAddressInput = this.driver.findElement(
            By.css('input#matcher_address')
          );
          saveAndApplyBtn = this.driver.findElement(
            By.css('button#networkSettingsSave')
          );
        });

        beforeEach(async function () {
          await clear(nodeAddressInput);
          await clear(matcherAddressInput);
        });

        it('Node address is required field', async function () {
          await saveAndApplyBtn.click();
          expect(await nodeAddressError.getText()).matches(/URL is required/i);
        });

        it('The address of non-existed node was entered', async function () {
          await nodeAddressInput.sendKeys(invalidNodeUrl);
          await saveAndApplyBtn.click();

          expect(
            await this.driver.wait(
              until.elementTextMatches(
                this.driver.findElement(
                  By.css('[data-testid="nodeAddressError"]')
                ),
                /Incorrect node address/i
              ),
              this.wait
            )
          ).not.to.be.throw;
        });

        it('Matcher address is not required field', async function () {
          await nodeAddressInput.sendKeys(this.nodeUrl);
          await saveAndApplyBtn.click();
          await this.driver.sleep(DEFAULT_ANIMATION_DELAY);

          expect(
            await this.driver.wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, 'editBtn@network')]")
              )
            )
          ).not.to.be.throw;
        });
      });
    });
  });
});
