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

    before(async function () {
        await App.initVault.call(this);

        await Network.switchTo.call(this, 'Testnet');
        await this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, '-intro-loader')]")), this.wait);
        await this.driver.wait(
            until.elementLocated(
                By.xpath(
                    "//div[contains(@class, '-network-network')]" + "//span[contains(@class, 'network-networkBottom')]"
                )
            ),
            this.wait
        );

        await CreateNewAccount.importAccount.call(this, 'rich', 'waves private node seed with waves tokens');

        await Settings.setMaxSessionTimeout.call(this);
    });

    function checkAnyTransaction(txFormLocator: By, wait?: number) {
        it('Is shown', async function () {
            expect(await this.driver.wait(until.elementLocated(txFormLocator), wait || this.wait)).not.to.be.throw;
            await this.driver.wait(
                until.elementIsEnabled(this.driver.findElement(By.css('button#approve'))),
                this.wait
            );
            await this.driver.findElement(By.css('button#reject')).click();
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-transactions-txFinal')]")),
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
                until.elementLocated(By.xpath("//div[contains(@class, '-transactions-txFinal')]")),
                this.wait
            );
            expect(await txFinalEl.findElements(By.css('.tx-reject-icon'))).length(1);
        });

        it('Approved', async function () {
            await this.driver.wait(until.elementLocated(txFormLocator), wait || this.wait);
            await this.driver
                .wait(until.elementIsEnabled(this.driver.findElement(By.css('button#approve'))), this.wait)
                .click();
            const txFinalEl: WebElement = await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-transactions-txFinal')]")),
                this.wait
            );
            expect(await txFinalEl.findElements(By.css('.tx-approve-icon'))).length(1);
        });
    }

    describe('Permission request from origin', function () {
        let authFormLocator = By.xpath("//div[contains(@class, '-originAuth-transaction')]");
        const REJECT_FOREVER = 'Reject forever';

        async function performPermissionRequest(origin) {
            await this.driver.get(`http://${origin}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
            await this.driver.executeScript(() => {
                // @ts-ignore
                WavesKeeper.initialPromise.then((api) => {
                    api.publicState();
                });
            });
        }

        beforeEach(async function () {
            const origin = this.currentTest.title != REJECT_FOREVER ? CUSTOMLIST[0] : CUSTOMLIST[1];
            await performPermissionRequest.call(this, origin);
            await this.driver.get(this.extensionUrl);
        });

        checkAnyTransaction(authFormLocator);

        it(REJECT_FOREVER, async function () {
            await this.driver.wait(until.elementLocated(authFormLocator), this.wait);
            await this.driver
                .findElement(By.xpath("//button[contains(@class, '-dropdownButton-dropdownButton')]"))
                .click();
            await this.driver.wait(until.elementLocated(By.css('button#rejectForever')), this.wait).click();
            const txFinalEl: WebElement = await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-transactions-txFinal')]")),
                this.wait
            );
            expect(await txFinalEl.findElements(By.css('.tx-reject-icon'))).length(1);
        });
    });

    describe('Authentication request from origin', function () {
        beforeEach(async function () {
            await this.driver.get(`http://${WHITELIST[0]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
            await this.driver.executeScript(() => {
                // @ts-ignore
                WavesKeeper.initialPromise.then((api) => {
                    api.auth({ data: 'generated auth data' });
                });
            });
            await this.driver.get(this.extensionUrl);
        });

        checkAnyTransaction(By.xpath("//div[contains(@class, '-auth-transaction')]"));
    });

    describe('Transactions', function () {
        async function performSignTransaction(tx: any) {
            await this.driver.get(`http://${WHITELIST[0]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
            await this.driver.executeScript((tx) => {
                // @ts-ignore
                WavesKeeper.initialPromise.then((api) => {
                    api.signTransaction(tx);
                });
            }, tx);
        }

        describe('Issue', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, ISSUE);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-issue-transaction')]"));

            it('Copying script to the clipboard');
        });

        describe('Transfer', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, TRANSFER);
                await this.driver.get(this.extensionUrl);
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
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-reissue-transaction')]"));
        });

        describe('Burn', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, BURN);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-burn-transaction')]"));
        });

        describe('Exchange', function () {
            it('Not supported yet');
        });

        describe('Lease', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, LEASE);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-lease-transaction')]"));
        });

        describe('Cancel lease', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, CANCEL_LEASE);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-cancelLease-transaction')]"));
        });

        describe('Alias', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, ALIAS);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-alias-transaction')]"));
            // TODO this checks should be into unittests
            it('Minimum alias length');
            it('Maximum alias length');
        });

        describe('MassTransfer', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, MASS_TRANSFER);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-massTransfer-transaction')]"));
        });

        describe('Data', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, DATA);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-data-transaction')]"));
        });

        describe('SetScript', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, SET_SCRIPT);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-setScript-transaction')]"));

            it('Copying script to the clipboard');
            it('Set');
            it('Cancel');
        });

        describe('Sponsorship', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, SPONSORSHIP);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-sponsorship-transaction')]"));

            it('Set');
            it('Cancel');
        });

        describe('SetAssetScript', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, SET_ASSET_SCRIPT);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-assetScript-transaction')]"));

            it('Copying script to the clipboard');
        });

        describe('InvokeScript', function () {
            beforeEach(async function () {
                await performSignTransaction.call(this, INVOKE_SCRIPT);
                await this.driver.get(this.extensionUrl);
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
            await this.driver.get(`http://${WHITELIST[0]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
            await this.driver.executeScript(script, tx);
        }

        describe('Create', function () {
            beforeEach(async function () {
                await performSignOrder.call(this, createOrder, CREATE_ORDER);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-createOrder-transaction')]"), 60 * 1000);
        });

        describe('Cancel', function () {
            beforeEach(async function () {
                await performSignOrder.call(this, cancelOrder, CANCEL_ORDER);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-cancelOrder-transaction')]"));
        });
    });

    describe('Multiple transactions package', function () {
        async function performSignTransactionPackage(tx: any[], name: string) {
            await this.driver.get(`http://${WHITELIST[0]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
            await this.driver.executeScript(
                (tx) => {
                    // @ts-ignore
                    WavesKeeper.initialPromise.then((api) => {
                        api.signTransactionPackage(tx, name);
                    });
                },
                tx,
                name
            );
        }

        beforeEach(async function () {
            await performSignTransactionPackage.call(this, PACKAGE, 'Test package');
            await this.driver.get(this.extensionUrl);
        });

        checkAnyTransaction(By.xpath("//div[contains(@class, '-package-transaction')]"));
    });

    describe('Custom data', function () {
        async function performSignCustomData(data: any) {
            await this.driver.get(`http://${WHITELIST[0]}`);
            await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
            await this.driver.executeScript((data) => {
                // @ts-ignore
                WavesKeeper.initialPromise.then((api) => {
                    api.signCustomData(data);
                });
            }, data);
        }

        describe('Version 1', function () {
            beforeEach(async function () {
                await performSignCustomData.call(this, CUSTOM_DATA_V1);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-customData-transaction')]"));
        });

        describe('Version 2', function () {
            beforeEach(async function () {
                await performSignCustomData.call(this, CUSTOM_DATA_V2);
                await this.driver.get(this.extensionUrl);
            });

            checkAnyTransaction(By.xpath("//div[contains(@class, '-customData-transaction')]"));
        });
    });
});
