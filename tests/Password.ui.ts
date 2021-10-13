import { By, until, WebElement } from 'selenium-webdriver';
import { expect } from 'chai';
import { clear } from './utils';

describe('Password management', () => {
    const PASSWORD = { SHORT: 'short', DEFAULT: 'strongpassword', NEW: 'verystrongpassword' };

    describe('Create password', function () {
        this.timeout(60 * 1000);
        let firstPasswordInput: WebElement,
            secondPasswordInput: WebElement,
            firstPasswordErrorDiv: WebElement,
            secondPasswordErrorDiv: WebElement;

        before(async function () {
            await this.driver.get(this.extensionUrl);
            // Get Started page
            await this.driver.wait(until.elementLocated(By.css('.app button[type=submit]')), this.wait).click();
            // Protect Your Account page
            firstPasswordInput = this.driver.wait(
                until.elementLocated(By.css('.app input#first[type=password]')),
                this.wait
            );
            firstPasswordErrorDiv = this.driver.findElement(
                By.xpath("//input[@id='first']//following-sibling::div[contains(@class, '-error-error')]")
            );
            secondPasswordInput = this.driver.findElement(By.css('.app input#second[type=password]'));
            secondPasswordErrorDiv = this.driver.findElement(
                By.xpath("//input[@id='second']//following-sibling::div[contains(@class, '-error-error')]")
            );
        });

        beforeEach(async function () {
            await firstPasswordInput.clear();
            await secondPasswordInput.clear();
        });

        it('Minimum password length 8 characters', async function () {
            await firstPasswordInput.sendKeys(PASSWORD.SHORT);
            expect(await firstPasswordErrorDiv.getText()).matches(/password is too short/i);
        });

        it('Passwords in both fields must mismatch', async function () {
            // check password mismatches
            await firstPasswordInput.sendKeys(PASSWORD.DEFAULT);
            await secondPasswordInput.sendKeys(PASSWORD.SHORT);
            expect(await secondPasswordErrorDiv.getText()).matches(/passwords does not match/i);
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
            await this.driver.findElement(By.css('.app input#termsAccepted[type=checkbox]')).click();
            await this.driver.findElement(By.css('.app input#conditionsAccepted[type=checkbox]')).click();
            await this.driver
                .wait(until.elementIsEnabled(this.driver.findElement(By.css('.app button[type=submit]'))), this.wait)
                .click();
            // check we are at create new account page
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-import-import')]")),
                this.wait
            );
            expect(await this.driver.findElement(By.css('.app button#createNewAccount')).getText()).matches(
                /create a new account/i
            );
        });
    });

    // this tests starts when we are at create new account page
    describe('Change password', function () {
        this.timeout(60 * 1000);

        let oldPasswordInput: WebElement, newFirstPasswordInput: WebElement, newSecondPasswordInput: WebElement;

        before(async function () {
            await this.driver.get(this.extensionUrl);
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
                .click();
            await this.driver.wait(until.elementLocated(By.css('button#settingsGeneral')), this.wait).click();
            await this.driver.wait(until.elementLocated(By.css('button#changePassword')), this.wait).click();
            oldPasswordInput = this.driver.wait(until.elementLocated(By.css('input#old[type=password]')), this.wait);
            newFirstPasswordInput = this.driver.findElement(By.css('input#first[type=password]'));
            newSecondPasswordInput = this.driver.findElement(By.css('input#second[type=password]'));
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
                        By.xpath("//input[@id='old']//following-sibling::div[contains(@class, '-error-error')]")
                    )
                    .getText()
            ).matches(/Password can't be so short/i);
            await clear(oldPasswordInput);

            await newFirstPasswordInput.sendKeys(PASSWORD.SHORT);
            await newFirstPasswordInput.sendKeys('\t');
            expect(
                await this.driver
                    .findElement(
                        By.xpath("//input[@id='first']//following-sibling::div[contains(@class, '-error-error')]")
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
                By.xpath("//input[@id='second']//following-sibling::div[contains(@class, '-error-error')]")
            );
            expect(await errDiv.getText()).matches(/New passwords does not match/i);
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
                By.xpath("//input[@id='second']//following-sibling::div[contains(@class, '-error-error')]")
            );
            expect(await errDiv.getText()).matches(/Old password is equal new/i);
            await clear(newFirstPasswordInput);

            await newFirstPasswordInput.sendKeys(PASSWORD.NEW);
            await newFirstPasswordInput.sendKeys('\t');
            expect(await errDiv.getText()).to.be.empty;
        });

        it('Successful password changed', async function () {
            await oldPasswordInput.sendKeys(PASSWORD.DEFAULT);
            await newFirstPasswordInput.sendKeys(PASSWORD.NEW);
            await newSecondPasswordInput.sendKeys(PASSWORD.NEW);

            await this.driver
                .wait(until.elementIsEnabled(this.driver.findElement(By.css('.app button[type=submit]'))), this.wait)
                .click();

            expect(
                await this.driver
                    .wait(until.elementIsVisible(this.driver.findElement(By.css('.modal.notification'))), this.wait)
                    .getText()
            ).matches(/Password changed/i);
        });
    });

    describe('Etc', function () {
        this.timeout(60 * 1000);
        let loginForm: WebElement, loginButton: WebElement, loginInput: WebElement;

        async function performLogout() {
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
                .click();
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-settings-logout')]")), this.wait)
                .click();
            loginForm = await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-login-content')]")),
                this.wait
            );
        }

        before(async function () {
            await this.driver.get(this.extensionUrl);
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
                        By.xpath("//input[@type='password']//following-sibling::div[contains(@class, '-error-error')]")
                    )
                    .getText()
            ).matches(/Wrong password/i);
            await loginInput.clear();
        });

        it('Correct password login', async function () {
            await loginInput.sendKeys(PASSWORD.NEW);
            await loginButton.click();
            // check we are at create new account page
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-import-import')]")),
                this.wait
            );
            expect(await this.driver.findElement(By.css('.app button[type=submit]')).getText()).matches(
                /create a new account/i
            );
        });

        it('Password reset', async function () {
            await performLogout.call(this);
            await loginForm.findElement(By.xpath("//div[contains(@class, '-login-forgotLnk')]")).click();
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-forgotAccount-content')]")), this.wait)
                .findElement(By.css('button[type=warning]'))
                .click();

            expect(
                await this.driver
                    .wait(until.elementLocated(By.xpath("//div[contains(@class, '-welcome-content')]")), this.wait)
                    .findElement(By.css('.app button[type=submit]'))
                    .getText()
            ).matches(/Get started/i);
        });
    });
});
