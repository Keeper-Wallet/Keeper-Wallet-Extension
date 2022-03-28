import { By, until, WebElement } from 'selenium-webdriver';
import { expect } from 'chai';
import { clear } from './utils';
import { App, CreateNewAccount } from './utils/actions';

describe('Password management', () => {
  const PASSWORD = {
    SHORT: 'short',
    DEFAULT: 'strongpassword',
    NEW: 'verystrongpassword',
  };
  let currentPassword: string;
  let tabKeeper, tabAccounts;

  after(async function () {
    await App.closeBgTabs.call(this, tabKeeper);
  });

  describe('Create password', function () {
    this.timeout(60 * 1000);
    let firstPasswordInput: WebElement,
      secondPasswordInput: WebElement,
      firstPasswordErrorDiv: WebElement,
      secondPasswordErrorDiv: WebElement;

    before(async function () {
      await App.open.call(this);

      tabKeeper = await this.driver.getWindowHandle();
      await this.driver.wait(
        async () => (await this.driver.getAllWindowHandles()).length === 2,
        this.wait
      );
      for (const handle of await this.driver.getAllWindowHandles()) {
        if (handle !== tabKeeper) {
          tabAccounts = handle;
          await this.driver.switchTo().window(tabAccounts);
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

      // Protect Your Account page
      firstPasswordInput = this.driver.wait(
        until.elementLocated(By.css('.app input#first[type=password]')),
        this.wait
      );
      firstPasswordErrorDiv = this.driver.findElement(
        By.xpath(
          "//input[@id='first']//following-sibling::div[contains(@class, '-error-error')]"
        )
      );
      secondPasswordInput = this.driver.findElement(
        By.css('.app input#second[type=password]')
      );
      secondPasswordErrorDiv = this.driver.findElement(
        By.xpath(
          "//input[@id='second']//following-sibling::div[contains(@class, '-error-error')]"
        )
      );
    });

    beforeEach(async function () {
      await firstPasswordInput.clear();
      await secondPasswordInput.clear();
    });

    it('Minimum password length 8 characters', async function () {
      await firstPasswordInput.sendKeys(PASSWORD.SHORT);
      expect(await firstPasswordErrorDiv.getText()).matches(
        /password is too short/i
      );
    });

    it('Passwords in both fields must mismatch', async function () {
      // check password mismatches
      await firstPasswordInput.sendKeys(PASSWORD.DEFAULT);
      await secondPasswordInput.sendKeys(PASSWORD.SHORT);
      expect(await secondPasswordErrorDiv.getText()).matches(
        /passwords do not match/i
      );
    });

    it('Passwords in both fields must match', async function () {
      await firstPasswordInput.sendKeys(PASSWORD.DEFAULT);
      await secondPasswordInput.sendKeys(PASSWORD.DEFAULT);
      expect(await secondPasswordErrorDiv.getText()).to.be.empty;
    });

    it('The ability to paste the password from the clipboard');

    it('Successful password creation', async function () {
      await firstPasswordInput.sendKeys(PASSWORD.DEFAULT);
      await secondPasswordInput.sendKeys(PASSWORD.DEFAULT);
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
      // check we are at create new account page
      await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-import-import')]")
        ),
        this.wait
      );
      expect(
        await this.driver
          .findElement(By.css('[data-testid="createNewAccountBtn"]'))
          .getText()
      ).matches(/create a new account/i);
    });
  });

  // this tests starts when we are at create new account page
  describe('Change password', function () {
    this.timeout(60 * 1000);

    let oldPasswordInput: WebElement,
      newFirstPasswordInput: WebElement,
      newSecondPasswordInput: WebElement;

    before(async function () {
      await this.driver.switchTo().window(tabKeeper);
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
        .wait(until.elementLocated(By.css('button#settingsGeneral')), this.wait)
        .click();
      await this.driver
        .wait(until.elementLocated(By.css('button#changePassword')), this.wait)
        .click();
      oldPasswordInput = this.driver.wait(
        until.elementLocated(By.css('input#old[type=password]')),
        this.wait
      );
      newFirstPasswordInput = this.driver.findElement(
        By.css('input#first[type=password]')
      );
      newSecondPasswordInput = this.driver.findElement(
        By.css('input#second[type=password]')
      );
    });

    beforeEach(async function () {
      await clear(oldPasswordInput);
      await clear(newFirstPasswordInput);
      await clear(newSecondPasswordInput);
    });

    it('Minimum password length 8 characters', async function () {
      await oldPasswordInput.sendKeys(PASSWORD.SHORT);
      await oldPasswordInput.sendKeys('\t');
      expect(
        await this.driver
          .findElement(
            By.xpath(
              "//input[@id='old']//following-sibling::div[contains(@class, '-error-error')]"
            )
          )
          .getText()
      ).matches(/Password can't be so short/i);
      await clear(oldPasswordInput);

      await newFirstPasswordInput.sendKeys(PASSWORD.SHORT);
      await newFirstPasswordInput.sendKeys('\t');
      expect(
        await this.driver
          .findElement(
            By.xpath(
              "//input[@id='first']//following-sibling::div[contains(@class, '-error-error')]"
            )
          )
          .getText()
      ).matches(/Password is too short/i);
      await clear(newFirstPasswordInput);
    });

    it('The ability to paste the password from the clipboard');

    it('Passwords in both fields must match', async function () {
      // check password mismatches
      await newFirstPasswordInput.sendKeys(PASSWORD.DEFAULT);
      await newSecondPasswordInput.sendKeys(PASSWORD.SHORT);
      await newFirstPasswordInput.sendKeys('\t');

      const errDiv = this.driver.findElement(
        By.xpath(
          "//input[@id='second']//following-sibling::div[contains(@class, '-error-error')]"
        )
      );
      expect(await errDiv.getText()).matches(/New passwords do not match/i);
      await clear(newSecondPasswordInput);

      await newSecondPasswordInput.sendKeys(PASSWORD.DEFAULT);
      await newFirstPasswordInput.sendKeys('\t');
      expect(await errDiv.getText()).to.be.empty;
    });

    it('New password cannot match old', async function () {
      await oldPasswordInput.sendKeys(PASSWORD.DEFAULT);
      await newFirstPasswordInput.sendKeys(PASSWORD.DEFAULT);
      await newFirstPasswordInput.sendKeys('\t');

      const errDiv = this.driver.findElement(
        By.xpath(
          "//input[@id='second']//following-sibling::div[contains(@class, '-error-error')]"
        )
      );
      expect(await errDiv.getText()).matches(/Old password is equal new/i);
      await clear(newFirstPasswordInput);

      await newFirstPasswordInput.sendKeys(PASSWORD.NEW);
      await newFirstPasswordInput.sendKeys('\t');
      expect(await errDiv.getText()).to.be.empty;
    });

    it('Successful password changed', async function () {
      await oldPasswordInput.sendKeys(PASSWORD.DEFAULT);
      currentPassword = PASSWORD.NEW;
      await newFirstPasswordInput.sendKeys(currentPassword);
      await newSecondPasswordInput.sendKeys(currentPassword);

      await this.driver
        .wait(
          until.elementIsEnabled(
            this.driver.findElement(By.css('.app button[type=submit]'))
          ),
          this.wait
        )
        .click();

      expect(
        await this.driver
          .wait(
            until.elementIsVisible(
              this.driver.findElement(By.css('.modal.notification'))
            ),
            this.wait
          )
          .getText()
      ).matches(/Password changed/i);
    });
  });

  describe('Etc', function () {
    this.timeout(60 * 1000);
    let loginForm: WebElement, loginButton: WebElement, loginInput: WebElement;

    async function performLogout() {
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
            By.xpath("//div[contains(@class, '-settings-logout')]")
          ),
          this.wait
        )
        .click();
      loginForm = await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-login-content')]")
        ),
        this.wait
      );
    }

    async function performLogin(password: string) {
      await this.driver
        .wait(until.elementLocated(By.css('input#loginPassword')), this.wait)
        .sendKeys(password);

      await this.driver
        .wait(
          until.elementIsEnabled(
            this.driver.findElement(By.css('button#loginEnter'))
          ),
          this.wait
        )
        .click();
    }

    before(async function () {
      await this.driver.switchTo().window(tabAccounts);
      await CreateNewAccount.importAccount.call(
        this,
        'rich',
        'waves private node seed with waves tokens'
      );
      await this.driver.switchTo().window(tabKeeper);
      await App.open.call(this);
    });

    it('Logout', async function () {
      await performLogout.call(this);
      loginButton = loginForm.findElement(By.css('button[type=submit]'));
      expect(await loginButton.getText()).matches(/Enter/i);
    });

    it('Incorrect password login', async function () {
      loginInput = loginForm.findElement(By.css('input[type=password]'));
      await loginInput.sendKeys(PASSWORD.DEFAULT);
      await loginButton.click();
      expect(
        await this.driver
          .findElement(
            By.xpath(
              "//input[@type='password']//following-sibling::div[contains(@class, '-error-error')]"
            )
          )
          .getText()
      ).matches(/Wrong password/i);
      await loginInput.clear();
    });

    it('Correct password login', async function () {
      await loginInput.sendKeys(currentPassword);
      await loginButton.click();

      expect(
        await this.driver.wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, '-assets-assets')]")
          ),
          this.wait
        )
      ).not.to.be.throw;
    });

    describe('Password reset', async function () {
      before(async function () {
        await performLogout.call(this);
      });

      it('"I forgot password" button opens recovery page and "Delete all" button is disabled', async function () {
        await loginForm
          .findElement(By.xpath("//div[contains(@class, '-login-forgotLnk')]"))
          .click();
        expect(
          await this.driver.wait(
            until.elementLocated(By.css('[data-testid="deleteAllAccounts"]')),
            this.wait
          )
        ).not.to.be.throw;
        expect(
          await this.driver
            .findElement(By.css('[data-testid="resetConfirm"]'))
            .isEnabled()
        ).to.be.false;
      });

      it('Clicking "Cancel" button returns to login page and login is available', async function () {
        await this.driver
          .findElement(By.css('[data-testid="resetCancel"]'))
          .click();
        expect(
          await this.driver.wait(
            until.elementLocated(By.css('input#loginPassword')),
            this.wait
          )
        ).not.to.be.empty;

        await performLogin.call(this, currentPassword);
        expect(
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          )
        ).not.to.be.throw;
        await performLogout.call(this);
      });

      describe('Delete all', function () {
        let confirmPhraseInput: WebElement,
          confirmPhraseErrorDiv: WebElement,
          resetConfirmBtn: WebElement,
          defaultPhrase: string;

        before(async function () {
          await this.driver
            .wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, '-login-content')]")
              ),
              this.wait
            )
            .findElement(
              By.xpath("//div[contains(@class, '-login-forgotLnk')]")
            )
            .click();

          defaultPhrase = await this.driver
            .wait(
              until.elementLocated(By.css('[data-testid="defaultPhrase"]')),
              this.wait
            )
            .getText();

          confirmPhraseInput = this.driver.findElement(
            By.css('[data-testid="confirmPhrase"]')
          );

          confirmPhraseErrorDiv = this.driver.findElement(
            By.css('[data-testid="confirmPhraseError"]')
          );

          resetConfirmBtn = this.driver.findElement(
            By.css('[data-testid="resetConfirm"]')
          );
        });

        beforeEach(async function () {
          await confirmPhraseInput.clear();
        });

        it('Entering right confirmation phrase enables "Delete all" button', async function () {
          await confirmPhraseInput.sendKeys(defaultPhrase);
          await confirmPhraseInput.sendKeys('\t');
          expect(await confirmPhraseErrorDiv.getText()).to.be.empty;
          expect(await resetConfirmBtn.isEnabled()).to.be.true;
        });

        it('Entering wrong confirmation phrase disables "Delete all" button', async function () {
          await confirmPhraseInput.sendKeys(defaultPhrase.toLowerCase());
          await confirmPhraseInput.sendKeys('\t');
          expect(await confirmPhraseErrorDiv.getText()).matches(
            /The phrase is entered incorrectly/i
          );
          expect(await resetConfirmBtn.isEnabled()).to.be.false;
        });

        it('Entering right phrase and clicking "Delete all" removes all accounts', async function () {
          await confirmPhraseInput.sendKeys(defaultPhrase);
          await resetConfirmBtn.click();

          expect(
            await this.driver
              .wait(
                until.elementLocated(
                  By.xpath("//div[contains(@class, '-welcome-content')]")
                ),
                this.wait
              )
              .findElement(By.css('.app button[type=submit]'))
              .getText()
          ).matches(/Get started/i);
        });
      });
    });
  });
});
