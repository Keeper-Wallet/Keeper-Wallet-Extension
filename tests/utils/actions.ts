import { By, until } from 'selenium-webdriver';

export async function resetWavesKeeperVault() {
    // need to bind this from test
    await this.driver.get(this.extensionUrl);
    await this.driver
        .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
        .click();

    await this.driver
        .wait(until.elementLocated(By.xpath("//div[contains(@class, '-settings-deleteAccounts')]")), this.wait)
        .click();

    await this.driver.wait(until.elementLocated(By.css('button#deleteAccount')), this.wait).click();
}
