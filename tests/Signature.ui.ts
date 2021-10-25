import { expect } from 'chai';
import { App, CreateNewAccount, Network, Settings } from './utils/actions';
import { CUSTOMLIST, DEFAULT_PAGE_LOAD_DELAY, WHITELIST } from './utils/constants';
import { By, until, WebElement } from 'selenium-webdriver';
import {
    ALIAS,
    BURN,
    CANCEL_LEASE,
    DATA,
    INVOKE_SCRIPT,
    ISSUE,
    LEASE,
    MASS_TRANSFER,
    PACKAGE,
    REISSUE,
    SET_ASSET_SCRIPT,
    SET_SCRIPT,
    SPONSORSHIP,
    TRANSFER,
} from './utils/transactions';
import { CANCEL_ORDER, CREATE_ORDER } from './utils/orders';
import { CUSTOM_DATA_V1, CUSTOM_DATA_V2 } from './utils/customData';

describe('Signature', function () {
    this.timeout(5 * 60 * 1000);

    let tabKeeper, tabOrigin;

    before(async function () {
        await App.initVault.call(this);
        await Network.switchTo.call(this, 'Testnet');
        await CreateNewAccount.importAccount.call(this, 'rich', 'waves private node seed with waves tokens');
        await Settings.setMaxSessionTimeout.call(this);

        tabKeeper = await this.driver.getWindowHandle();
        await this.driver.switchTo().newWindow('tab');
        tabOrigin = await this.driver.getWindowHandle();
    });

    after(async function () {
        await this.driver.switchTo().window(tabOrigin);
        await this.driver.close();
        await this.driver.switchTo().window(tabKeeper);
        await App.resetVault.call(this);
    });

    function checkAnyTransaction(txFormLocator: By, wait?: number) {
        it('Is shown', async function () {
            expect(await this.driver.wait(until.elementLocated(txFormLocator), wait || this.wait)).not.to.be.throw;
            await this.driver.wait(
                until.elementIsEnabled(this.driver.findElement(By.css('button#approve'))),
                this.wait
            );
            await this.driver.findElement(By.css('button#reject')).click();
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-final-transaction')]")), this.wait)
                .findElement(By.css('button#close'))
                .click();
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-assets-assets')]")),
                this.wait
            );
        });

        it('Rejected', async function () {
            await this.driver.wait(until.elementLocated(txFormLocator), wait || this.wait);
            await this.driver.wait(
                until.elementIsEnabled(this.driver.findElement(By.css('button#approve'))),
                this.wait
            );
            await this.driver.findElement(By.css('button#reject')).click();
            const txFinalEl: WebElement = this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-final-transaction')]")),
                this.wait
            );
            expect(await txFinalEl.findElements(By.css('.tx-reject-icon'))).length(1);
            await txFinalEl.findElement(By.css('button#close')).click();
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-assets-assets')]")),
                this.wait
            );
        });

        it('Approved', async function () {
            await this.driver.wait(until.elementLocated(txFormLocator), wait || this.wait);
            await this.driver
                .wait(until.elementIsEnabled(this.driver.findElement(By.css('button#approve'))), this.wait)
                .click();
            const txFinalEl: WebElement = await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-final-transaction')]")),
                this.wait
            );
            expect(await txFinalEl.findElements(By.css('.tx-approve-icon'))).length(1);
            await txFinalEl.findElement(By.css('button#close')).click();
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-assets-assets')]")),
                this.wait
            );
        });
    }

    describe('Permission request from origin', function () {
        let authFormLocator = By.xpath("//div[contains(@class, '-originAuth-transaction')]");
        const REJECT_FOREVER = 'Reject forever';
        let lastOrigin;

        beforeEach(async function () {
            await this.driver.switchTo().window(tabOrigin);

            const origin = this.currentTest.title != REJECT_FOREVER ? CUSTOMLIST[0] : CUSTOMLIST[1];
            if (origin !== lastOrigin) {
                await this.driver.get(`http://${origin}`);
            }
            await this.driver.executeScript(() => {
                // @ts-ignore
                WavesKeeper.initialPromise.then((api) => {
                    api.publicState();
                });
            });

            await this.driver.switchTo().window(tabKeeper);
        });

        checkAnyTransaction(authFormLocator);

        it(REJECT_FOREVER, async function () {
            await this.driver.wait(until.elementLocated(authFormLocator), this.wait);
            await this.driver
                .findElement(By.xpath("//button[contains(@class, '-dropdownButton-dropdownButton')]"))
                .click();
            await this.driver.wait(until.elementLocated(By.css('button#rejectForever')), this.wait).click();
            const txFinalEl: WebElement = await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-final-transaction')]")),
                this.wait
            );
            expect(await txFinalEl.findElements(By.css('.tx-reject-icon'))).length(1);
            await txFinalEl.findElement(By.css('button#close')).click();
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-assets-assets')]")),
                this.wait
            );
        });
    });

    describe('Authentication request from origin', function () {
        before(async function () {
            await this.driver.switchTo().window(tabOrigin);
            await this.driver.get(`http://${WHITELIST[3]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
        });

        beforeEach(async function () {
            await this.driver.switchTo().window(tabOrigin);

            await this.driver.executeScript(() => {
                // @ts-ignore
                WavesKeeper.initialPromise.then((api) => {
                    api.auth({ data: 'generated auth data' });
                });
            });

            await this.driver.switchTo().window(tabKeeper);
        });

        checkAnyTransaction(By.xpath("//div[contains(@class, '-auth-transaction')]"));
    });

    describe('Transactions', function () {
        async function performSignTransaction(tx: any) {
            await this.driver.switchTo().window(tabOrigin);

            await this.driver.executeScript((tx) => {
                // @ts-ignore
                WavesKeeper.initialPromise.then((api) => {
                    api.signTransaction(tx);
                });
            }, tx);

            await this.driver.switchTo().window(tabKeeper);
        }

        before(async function () {
            await this.driver.switchTo().window(tabOrigin);
            await this.driver.get(`http://${WHITELIST[3]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
        });

        describe('Issue', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, ISSUE);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-issue-transaction')]"));

            it('Copying script to the clipboard');
        });

        describe('Transfer', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, TRANSFER);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-transfer-transaction')]"));
            // TODO this checks should be into unittests
            it('Address');
            it('Alias');
            it('Waves / asset / smart asset');
            it('Attachment');
            it('Transfers to Gateways');
        });

        describe('Reissue', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, REISSUE);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-reissue-transaction')]"));
        });

        describe('Burn', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, BURN);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-burn-transaction')]"));
        });

        describe('Exchange', function () {
            it('Not supported yet');
        });

        describe('Lease', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, LEASE);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-lease-transaction')]"));
        });

        describe('Cancel lease', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, CANCEL_LEASE);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-cancelLease-transaction')]"));
        });

        describe('Alias', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, ALIAS);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-alias-transaction')]"));
            // TODO this checks should be into unittests
            it('Minimum alias length');
            it('Maximum alias length');
        });

        describe('MassTransfer', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, MASS_TRANSFER);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-massTransfer-transaction')]"));
        });

        describe('Data', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, DATA);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-data-transaction')]"));
        });

        describe('SetScript', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, SET_SCRIPT);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-setScript-transaction')]"));

            it('Copying script to the clipboard');
            it('Set');
            it('Cancel');
        });

        describe('Sponsorship', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, SPONSORSHIP);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-sponsorship-transaction')]"));

            it('Set');
            it('Cancel');
        });

        describe('SetAssetScript', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, SET_ASSET_SCRIPT);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-assetScript-transaction')]"));

            it('Copying script to the clipboard');
        });

        describe('InvokeScript', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, INVOKE_SCRIPT);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-scriptInvocation-transaction')]"));

            // TODO this checks should be into unittests
            it('dApp: address / alias');
            it('Function name at max length');
            it('Default function call');
            it('Maximum number of arguments');
            it('Arguments of all types (primitives and List of unions)');
            describe('Payment', function () {
                it('Zero count');
                it('Maximum count');
                it('Waves / asset / smart asset');
            });
        });

        describe('UpdateAssetInfo', function () {
            it('Not supported yet');
        });
    });

    describe('Order', function () {
        const createOrder = (tx) => {
            // @ts-ignore
            WavesKeeper.initialPromise.then((api) => {
                api.signOrder(tx);
            });
        };
        const cancelOrder = (tx) => {
            // @ts-ignore
            WavesKeeper.initialPromise.then((api) => {
                api.signCancelOrder(tx);
            });
        };

        async function performSignOrder(script: (tx: any) => {}, tx: any) {
            await this.driver.switchTo().window(tabOrigin);

            await this.driver.executeScript(script, tx);

            await this.driver.switchTo().window(tabKeeper);
        }

        before(async function () {
            await this.driver.switchTo().window(tabOrigin);
            await this.driver.get(`http://${WHITELIST[3]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
        });

        describe('Create', function () {
            beforeEach(async function () {
                await performSignOrder.call(this, createOrder, CREATE_ORDER);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-createOrder-transaction')]"), 60 * 1000);
        });

        describe('Cancel', function () {
            beforeEach(async function () {
                await performSignOrder.call(this, cancelOrder, CANCEL_ORDER);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-cancelOrder-transaction')]"));
        });
    });

    describe('Multiple transactions package', function () {
        async function performSignTransactionPackage(tx: any[], name: string) {
            await this.driver.switchTo().window(tabOrigin);

            await this.driver.executeScript(
                (tx, name) => {
                    // @ts-ignore
                    WavesKeeper.initialPromise.then((api) => {
                        api.signTransactionPackage(tx, name);
                    });
                },
                tx,
                name
            );

            await this.driver.switchTo().window(tabKeeper);
        }

        before(async function () {
            await this.driver.switchTo().window(tabOrigin);
            await this.driver.get(`http://${WHITELIST[3]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
        });

        beforeEach(async function () {
            await performSignTransactionPackage.call(this, PACKAGE, 'Test package');
        });

        checkAnyTransaction(By.xpath("//div[contains(@class, '-package-transaction')]"));
    });

    describe('Custom data', function () {
        async function performSignCustomData(data: any) {
            await this.driver.switchTo().window(tabOrigin);

            await this.driver.executeScript((data) => {
                // @ts-ignore
                WavesKeeper.initialPromise.then((api) => {
                    api.signCustomData(data);
                });
            }, data);

            await this.driver.switchTo().window(tabKeeper);
        }

        before(async function () {
            await this.driver.switchTo().window(tabOrigin);
            await this.driver.get(`http://${WHITELIST[3]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
        });

        describe('Version 1', function () {
            beforeEach(async function () {
                await performSignCustomData.call(this, CUSTOM_DATA_V1);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-customData-transaction')]"));
        });

        describe('Version 2', function () {
            beforeEach(async function () {
                await performSignCustomData.call(this, CUSTOM_DATA_V2);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-customData-transaction')]"));
        });
    });
});
