import { expect } from 'chai';
import { clear } from './utils';
import { App, CreateNewAccount, Network } from './utils/actions';
import { By, until, WebElement } from 'selenium-webdriver';
import { DEFAULT_ANIMATION_DELAY } from './utils/constants';

describe('Network management', function () {
  this.timeout(60 * 1000);

  let tabKeeper;

  before(async function () {
    await App.initVault.call(this);
  });

  after(async function () {
    await Network.switchToAndCheck.call(this, 'Mainnet');
    await App.closeBgTabs.call(this, tabKeeper);
    await App.resetVault.call(this);
  });

  describe('Switching networks', function () {
    it('Stagenet', async function () {
      await Network.switchToAndCheck.call(this, 'Stagenet');
    });

    it('Mainnet', async function () {
      await Network.switchToAndCheck.call(this, 'Mainnet');
    });

    describe('Testnet', function () {
      it('Successfully switched', async function () {
        await Network.switchToAndCheck.call(this, 'Testnet');
      });

      it('Imported testnet account starts with 3N or 3M', async function () {
        // save popup and accounts refs
        const handles = await this.driver.getAllWindowHandles();
        tabKeeper = handles[0];
        await this.driver
          .wait(
            until.elementLocated(By.css('[data-testid="importForm"]')),
            this.wait
          )
          .findElement(By.css('[data-testid="addAccountBtn"]'))
          .click();
        await this.driver.wait(
          async () => (await this.driver.getAllWindowHandles()).length === 3,
          this.wait
        );
        for (const handle of await this.driver.getAllWindowHandles()) {
          if (handle !== tabKeeper && handle !== this.serviceWorkerTab) {
            await this.driver.switchTo().window(handle);
            await this.driver.navigate().refresh();
            break;
          }
        }
        await CreateNewAccount.importAccount.call(
          this,
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
                By.xpath("//div[contains(@class, '-copy-copyTextOverflow')]")
              ),
              this.wait
            )
            .getText()
        ).to.be.matches(/^3[MN]/i);

        await this.driver.findElement(By.css('div.arrow-back-icon')).click();
        this.driver.wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, '-assets-assets')]")
          ),
          this.wait
        );
      });
    });

    describe('Custom', function () {
      const validNodeUrl = 'https://nodes.wavesnodes.com';
      const invalidNodeUrl = 'https://nodes.invalid.com';
      const customNetwork = 'Custom';

      it('Successfully switched', async function () {
        await Network.switchTo.call(this, customNetwork);

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
          .sendKeys(validNodeUrl);

        await this.driver
          .findElement(By.css('button#networkSettingsSave'))
          .click();

        await Network.checkNetwork.call(this, customNetwork);
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
                By.xpath("//div[contains(@class,'-network-editBtn')]")
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
          await nodeAddressInput.sendKeys(validNodeUrl);
          await saveAndApplyBtn.click();
          await this.driver.sleep(DEFAULT_ANIMATION_DELAY);

          expect(
            await this.driver.wait(
              until.elementLocated(
                By.xpath("//div[contains(@class,'-network-editBtn')]")
              )
            )
          ).not.to.be.throw;
        });
      });
    });
  });
});
