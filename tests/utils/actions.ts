/**
 * Basic actions for tests.
 *
 * NOTE: Each of them needs to bind `this` from test.
 */
import { By, until } from 'selenium-webdriver';
import { DEFAULT_PASSWORD } from './constants';

export const App = {
    initVault: async function (password: string = DEFAULT_PASSWORD) {
        await this.driver.get(this.extensionUrl);

        await this.driver.wait(until.elementLocated(By.css('.app button[type=submit]')), this.wait).click();

        await this.driver
            .wait(until.elementLocated(By.css('.app input#first[type=password]')), this.wait)
            .sendKeys(password);
        await this.driver.findElement(By.css('.app input#second[type=password]')).sendKeys(password);
        await this.driver.findElement(By.css('.app input#termsAccepted[type=checkbox]')).click();
        await this.driver.findElement(By.css('.app input#conditionsAccepted[type=checkbox]')).click();
        await this.driver
            .wait(until.elementIsEnabled(this.driver.findElement(By.css('.app button[type=submit]'))), this.wait)
            .click();

        await this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, '-import-import')]")), this.wait);
    },

    resetVault: async function () {
        await this.driver.get(this.extensionUrl);

        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
            .click();

        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-settings-deleteAccounts')]")), this.wait)
            .click();

        await this.driver.wait(until.elementLocated(By.css('button#deleteAccount')), this.wait).click();
    },
};

export const CreateNewAccount = {
    importAccount: async function (name: string, seed: string) {
        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class,'-import-importChooser')]")), this.wait)
            .click();

        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-importSeed-content')]//textarea")), this.wait)
            .sendKeys(seed);
        await this.driver
            .wait(until.elementIsEnabled(this.driver.findElement(By.css('button#importAccount'))), this.wait)
            .click();

        await this.driver.wait(until.elementLocated(By.css('input#newAccountName')), this.wait).sendKeys(name);
        await this.driver
            .wait(until.elementIsEnabled(this.driver.findElement(By.css('button#continue'))), this.wait)
            .click();
        await this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, '-assets-assets')]")), this.wait);
    },
};

export const Settings = {
    setMaxSessionTimeout: async function () {
        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
            .click();
        await this.driver.wait(until.elementLocated(By.css('button#settingsGeneral')), this.wait).click();

        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-index-selectInput')]")), this.wait)
            .click();
        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-index-listItem')][last()]")), this.wait)
            .click();
    },
};

export const Network = {
    switchTo: async function (network: string) {
        await this.driver
            .wait(until.elementLocated(By.xpath("//i[contains(@class, '-network-networkIcon')]")), this.wait)
            .click();

        await this.driver.executeScript(
            (el) => el.click(),
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
};
