import * as mocha from 'mocha';
import { App, Assets, CreateNewAccount } from './utils/actions';
import { By, until, WebElement } from 'selenium-webdriver';
import { clear } from './utils';
import { expect } from 'chai';
import {
  DEFAULT_ANIMATION_DELAY,
  DEFAULT_PASSWORD,
  DEFAULT_SWITCH_TABS_DELAY,
} from './utils/constants';

describe('Account management', function () {
  this.timeout(60 * 1000);

  before(async function () {
    await App.initVault.call(this, DEFAULT_PASSWORD);
    await CreateNewAccount.importAccount.call(
      this,
      'rich',
      'waves private node seed with waves tokens'
    );

    await Assets.addAccount.call(this);
    await CreateNewAccount.importAccount.call(
      this,
      'poor',
      'waves private node seed without waves tokens'
    );
  });

  after(App.resetVault);

  describe('Accounts list', function () {
    it('Change active account', async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="otherAccountsButton"]')),
          this.wait
        )
        .click();

      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="accountCard"]')),
          this.wait
        )
        .click();

      expect(await Assets.getActiveAccountName.call(this)).to.equal('poor');
    });

    it('Updating account balances on import');

    it('The balance reflects the leased WAVES');

    it('Copying the address of the active account on the accounts screen');

    describe('Show QR', function () {
      after(async function () {
        await this.driver.findElement(By.css('div.arrow-back-icon')).click();
      });

      it('Opening the screen with the QR code of the address by clicking the "Show QR" button', async function () {
        await this.driver
          .wait(
            until.elementLocated(
              By.css('[data-testid="activeAccountCard"] .showQrIcon')
            ),
            this.wait
          )
          .click();

        expect(
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-selectedAccountQr')]")
            ),
            this.wait
          )
        ).not.to.be.throw;
      });

      it('Check that QR matches the displayed address');

      it('Download QR code'); // file downloaded, filename equals "${address}.png"
    });
  });

  function accountPropertiesShouldBeRight(this: mocha.Context) {
    describe('Address', function () {
      it('Is displayed', async function () {
        expect(
          await this.driver
            .findElement(
              By.xpath(
                "//div[@id='accountInfoAddress']//div[contains(@class, '-copy-copyTextOverflow')]"
              )
            )
            .getText()
        ).matches(/\w+/i);
      });

      it('Copying by clicking the "Copy" button');
    });

    describe('Public key', function () {
      it('Is displayed', async function () {
        expect(
          await this.driver
            .findElement(
              By.xpath(
                "//div[@id='accountInfoPublicKey']//div[contains(@class, '-copy-copyTextOverflow')]"
              )
            )
            .getText()
        ).matches(/\w+/i);
      });

      it('Copying by clicking the "Copy" button');
    });

    describe('Private key', function () {
      it('Is hidden', async function () {
        expect(
          await this.driver
            .findElement(
              By.xpath(
                "//div[@id='accountInfoPrivateKey']//div[contains(@class, '-copy-copyTextOverflow')]"
              )
            )
            .getText()
        ).not.matches(/\w+/i);
      });

      describe('Copying by clicking the "Copy" button', function () {
        before(async function () {
          await this.driver
            .findElement(
              By.xpath(
                "//div[@id='accountInfoPrivateKey']//div[contains(@class, '-copy-lastIcon')]"
              )
            )
            .click();
        });

        it('Clicking "Copy" displays the password entry form', async function () {
          expect(
            await this.driver.wait(
              until.elementLocated(By.css('form#enterPassword')),
              this.wait
            )
          ).not.to.be.throw;
          await this.driver
            .findElement(By.css('button#passwordCancel'))
            .click();
        });

        it('Clicking "Cancel" does not copy');

        it('Clicking "Copy" and entering the correct password will copy it');
      });
    });

    describe('Backup phrase', function () {
      it('Is hidden', async function () {
        expect(
          await this.driver
            .findElement(
              By.xpath(
                "//div[@id='accountInfoBackupPhrase']//div[contains(@class, '-copy-copyTextOverflow')]"
              )
            )
            .getText()
        ).not.matches(/\w+/i);
      });

      describe('Copying by clicking the "Copy" button', function () {
        before(async function () {
          await this.driver
            .findElement(
              By.xpath(
                "//div[@id='accountInfoBackupPhrase']//div[contains(@class, '-copy-lastIcon')]"
              )
            )
            .click();
          await this.driver.wait(
            until.elementLocated(By.css('form#enterPassword')),
            this.wait
          );
        });

        after(async function () {
          await this.driver
            .findElement(By.css('button#passwordCancel'))
            .click();
        });

        it('Clicking "Cancel" does not copy');

        it('Clicking "Copy" and entering the correct password will copy it');
      });
    });

    describe('Rename an account', function () {
      let newAccountNameInput: WebElement,
        newAccountNameErr: WebElement,
        saveBtn: WebElement,
        currentAccountName: string,
        newAccountName: string;

      before(async function () {
        await this.driver
          .wait(
            until.elementLocated(
              By.xpath("//button[contains(@class, '-accountInfo-accountName')]")
            ),
            this.wait
          )
          .click();
        newAccountNameInput = this.driver.wait(
          until.elementLocated(By.css('input#newAccountName')),
          this.wait
        );
        newAccountNameErr = this.driver.findElement(
          By.xpath(
            "//input[@id='newAccountName']//following-sibling::div[contains(@class, '-error-error')]"
          )
        );
        saveBtn = this.driver.findElement(By.css('button#save'));
        currentAccountName = await this.driver
          .findElement(By.css('div#currentAccountName'))
          .getText();
      });

      it('A name that is already in use cannot be specified', async function () {
        await newAccountNameInput.sendKeys(currentAccountName);
        await newAccountNameInput.sendKeys('\t');
        expect(await newAccountNameErr.getText()).matches(
          /Name already exist/i
        );
        expect(await saveBtn.isEnabled()).to.be.false;
        await clear(newAccountNameInput);
      });

      it('Unique name specified', async function () {
        newAccountName = currentAccountName.slice(1);
        await newAccountNameInput.sendKeys(newAccountName);
        await newAccountNameInput.sendKeys('\t');
        expect(await newAccountNameErr.getText()).to.be.empty;
        expect(await saveBtn.isEnabled()).to.be.true;
      });

      it('Successfully changed account name', async function () {
        await saveBtn.click();

        expect(
          await this.driver
            .wait(
              until.elementIsVisible(
                this.driver.findElement(By.css('.modal.notification'))
              ),
              this.wait
            )
            .getText()
        ).matches(/Account name changed/i);

        await this.driver.sleep(DEFAULT_ANIMATION_DELAY);

        expect(
          await this.driver
            .wait(
              until.elementLocated(
                By.xpath(
                  "//button[contains(@class, '-accountInfo-accountName')]//span"
                )
              ),
              this.wait
            )
            .getText()
        ).to.be.equal(newAccountName);
      });
    });

    describe('Delete account', function () {
      beforeEach(async function () {
        await this.driver
          .wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-accountInfo-deleteButton')]")
            ),
            this.wait
          )
          .click();
        await this.driver.wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, '-deleteAccount-content')]")
          ),
          this.wait
        );
      });

      it('Click "Back" on the account deletion confirmation screen - the account is not deleted', async function () {
        await this.driver.findElement(By.css('div.arrow-back-icon')).click();
        expect(
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-accountInfo-content')]")
            ),
            this.wait
          )
        ).not.to.be.throw;
      });

      it('Click "Delete account" deletes the account', async function () {
        await this.driver.findElement(By.css('button#deleteAccount')).click();

        expect(
          await this.driver.wait(
            until.elementLocated(
              By.xpath(
                "//div[(contains(@class, '-assets-assets') or contains(@class, '-import-import'))]"
              )
            ),
            this.wait
          )
        ).not.to.be.throw;
      });
    });
  }

  describe('Inactive account', async function () {
    before(async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="otherAccountsButton"]')),
          this.wait
        )
        .click();
    });

    it('By clicking on account - go to the account properties screen', async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="accountInfoButton"]')),
          this.wait
        )
        .click();

      expect(
        await this.driver.wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, '-accountInfo-content')]")
          ),
          this.wait
        )
      ).not.to.be.throw;
    });

    accountPropertiesShouldBeRight.call(this);
  });

  describe('Active account', async function () {
    it('By clicking on account - go to the account properties screen', async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="activeAccountCard"]')),
          this.wait
        )
        .click();

      expect(
        await this.driver.wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, '-accountInfo-content')]")
          ),
          this.wait
        )
      ).not.to.be.throw;
    });

    accountPropertiesShouldBeRight.call(this);
  });
});
