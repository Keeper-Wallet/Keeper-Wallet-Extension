import { By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import { App, CreateNewAccount, Settings } from './utils/actions';
import { CUSTOMLIST, WHITELIST } from './utils/constants';

describe('Messages', function () {
    const PAGE_LOAD_DELAY = 500;
    const NOTIFICATION_REPEAT_DELAY = 30 * 1000 + 100;

    this.timeout(2 * 60 * 1000);

    const sendMessage = () => {
        // @ts-ignore
        WavesKeeper.initialPromise.then((api) => {
            api.notification({ title: 'Hello!', message: 'World!' });
        });
    };

    async function sendMessageFromOrigin(origin: string, ms: number) {
        ms = ms || PAGE_LOAD_DELAY;
        await this.driver.get(`https://${origin}`);
        await this.driver.sleep(ms);
        await this.driver.executeScript(sendMessage);
    }

    before(async function () {
        await App.initVault.call(this);
        await CreateNewAccount.importAccount.call(this, 'rich', 'waves private node seed with waves tokens');
        await Settings.setMaxSessionTimeout.call(this);
    });

    after(async function () {
        await App.resetVault.call(this);
    });

    it('Allowed messages from all resources from WhiteList', async function () {
        for (const origin of WHITELIST) {
            await sendMessageFromOrigin.call(this, origin);

            await this.driver.get(this.extensionUrl);
            expect(
                await this.driver
                    .wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-messageList-messageList')]")),
                        this.wait
                    )
                    .findElements(By.xpath("//div[contains(@class, '-messageList-messageItemInner')]"))
            ).not.to.be.empty;

            await this.driver.findElement(By.css('button#closeNotification')).click();
        }
    });

    it('When a message is received from a new resource, permission is requested to access', async function () {
        await sendMessageFromOrigin.call(this, CUSTOMLIST[0]);

        await this.driver.get(this.extensionUrl);
        // permission request is shown
        expect(
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-originAuth-transaction')]")),
                this.wait
            )
        ).not.to.be.throw;
    });

    it('When allowing access to messages - the message is instantly displayed', async function () {
        // expand permission settings
        await this.driver
            .findElement(
                By.xpath("//div[contains(@class, '-originAuth-collapsed')]//div[contains(@class, '-index-title')]")
            )
            .click();

        await this.driver
            .wait(until.elementIsVisible(this.driver.findElement(By.css('input#checkbox_noshow'))), this.wait)
            .click();

        await this.driver.findElement(By.css('button#approve')).click();

        expect(
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-messageList-messageList')]")), this.wait)
                .findElements(By.xpath("//div[contains(@class, '-messageList-messageItemInner')]"))
        ).not.to.be.empty;

        await this.driver.findElement(By.css('button#closeNotification')).click();
    });

    const lastOrigin = CUSTOMLIST[1];
    it('When allowing access to an application, but denying messages - messages are not displayed', async function () {
        await sendMessageFromOrigin.call(this, lastOrigin);

        await this.driver.get(this.extensionUrl);
        // permission request is shown
        await this.driver.wait(
            until.elementLocated(By.xpath("//div[contains(@class, '-originAuth-transaction')]")),
            this.wait
        );
        await this.driver.findElement(By.css('button#approve')).click();

        expect(
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-transactions-txFinal')]")),
                this.wait
            )
        ).not.to.be.throw;
    });

    it('When allowing access from settings - messages are displayed', async function () {
        await this.driver.get(this.extensionUrl);

        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
            .click();

        await this.driver.wait(until.elementLocated(By.css('button#settingsPermission')), this.wait).click();

        await this.driver
            .wait(
                until.elementLocated(
                    By.xpath(
                        "//div[contains(@class, '-list-permissionItem')][last()]" +
                            "//button[contains(@class, '-list-settings')]"
                    )
                ),
                this.wait
            )
            .click();
        await this.driver
            .wait(until.elementIsVisible(this.driver.findElement(By.css('input#checkbox_noshow'))), this.wait)
            .click();

        const saveButton = this.driver.findElement(By.css('button#save'));
        await saveButton.click();

        await this.driver.wait(until.elementIsNotVisible(saveButton), this.wait);

        await sendMessageFromOrigin.call(this, lastOrigin);

        await this.driver.get(this.extensionUrl);
        expect(
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-messageList-messageList')]")), this.wait)
                .findElements(By.xpath("//div[contains(@class, '-messageList-messageItemInner')]"))
        ).not.to.be.empty;
        await this.driver.findElement(By.css('button#closeNotification')).click();
    });

    it('When receiving several messages from one resource - messages are displayed as a "batch"', async function () {
        /*

         */
        await sendMessageFromOrigin.call(this, WHITELIST[0]);
        await this.driver.sleep(NOTIFICATION_REPEAT_DELAY);
        await sendMessageFromOrigin.call(this, WHITELIST[0]);

        await this.driver.get(this.extensionUrl);
        expect(
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-messageList-messageList')]")), this.wait)
                .findElements(By.xpath("//div[contains(@class, '-messageList-messageItemInner')]"))
        ).length(2);
        // do not clear messages for next test
    });

    it('When receiving messages from several resources - messages are displayed in several blocks', async function () {
        await sendMessageFromOrigin.call(this, WHITELIST[1]);

        await this.driver.get(this.extensionUrl);
        expect(
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-messageList-messageList')]")), this.wait)
                .findElements(By.xpath("//div[contains(@class, '-messageList-cardItem')]"))
        ).length(2);
        // do not clear messages for next test
    });

    it('The "Clear all" button closes all messages', async function () {
        await this.driver.findElement(By.css('button#clearAllMessages')).click();
        await this.driver.sleep(PAGE_LOAD_DELAY);

        expect(
            await this.driver.findElements(
                By.xpath(
                    "//div[contains(@class, '-messageList-messageList')]" +
                        "//div[contains(@class, '-messageList-cardItem')]"
                )
            )
        ).to.be.empty;
    });

    // TODO looks like these units need to be checked in unittests
    it('You cannot send messages from one resource more often than once every 30 seconds');
    it('The message title cannot be longer than 20 characters');
    it('The message text cannot be longer than 250 characters');
    it('Title is a required field');
    it('Message is an optional field');
    it('Encrypting and decrypting messages');
});
