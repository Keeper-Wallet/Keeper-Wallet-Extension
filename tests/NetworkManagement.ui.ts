import { expect } from 'chai';
import { clear } from './utils';
import { App, CreateNewAccount, Network } from './utils/actions';
import { By, until, WebElement } from 'selenium-webdriver';
import { DEFAULT_ANIMATION_DELAY } from './utils/constants';

describe('Network management', function () {
    this.timeout(60 * 1000);

    before(async function () {
        await App.initVault.call(this);
    });

    after(async function () {
        await Network.switchTo.call(this, 'Mainnet');
        await App.resetVault.call(this);
    });

    describe('Switching networks', function () {
        async function expectNetworkChangedTo(network: string) {
            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-intro-loader')]")),
                this.wait
            );

            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-import-import')]")),
                this.wait
            );

            expect(
                await this.driver
                    .wait(
                        until.elementLocated(
                            By.xpath(
                                "//div[contains(@class, '-network-network')]" +
                                    "//span[contains(@class, 'network-networkBottom')]"
                            )
                        ),
                        this.wait
                    )
                    .getText()
            ).matches(new RegExp(network, 'i'));
        }

        async function networkShouldBeChangedTo(network: string) {
            await Network.switchTo.call(this, network);
            await expectNetworkChangedTo.call(this, network);
        }

        it('Stagenet', async function () {
            await networkShouldBeChangedTo.call(this, 'Stagenet');
        });

        it('Mainnet', async function () {
            await networkShouldBeChangedTo.call(this, 'Mainnet');
        });

        describe('Testnet', function () {
            it('Successfully switched', async function () {
                await networkShouldBeChangedTo.call(this, 'Testnet');
            });

            it('Imported testnet account starts with 3N or 3M', async function () {
                await CreateNewAccount.importAccount.call(this, 'rich', 'waves private node seed with waves tokens');
                await this.driver
                    .wait(
                        until.elementIsVisible(
                            this.driver.wait(
                                until.elementLocated(
                                    By.xpath(
                                        "//div[contains(@class, '-assets-assets')]" +
                                            "//div[contains(@class, '-wallet-activeWallet')]" +
                                            "//div[contains(@class, '-wallet-accountName')]"
                                    )
                                ),
                                this.wait
                            )
                        ),
                        this.wait
                    )
                    .click();

                expect(
                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-copy-copyTextOverflow')]")),
                            this.wait
                        )
                        .getText()
                ).to.be.matches(/^3[MN]/i);

                await this.driver.findElement(By.css('div.arrow-back-icon')).click();
                this.driver.wait(
                    until.elementLocated(By.xpath("//div[contains(@class, '-assets-assets')]")),
                    this.wait
                );
            });
        });

        describe('Custom', function () {
            const validNodeUrl = 'https://nodes.wavesplatform.com';
            const invalidNodeUrl = 'https://nodes.invalid.com';
            const customNetwork = 'Custom';

            it('Successfully switched', async function () {
                await Network.switchTo.call(this, customNetwork);

                await this.driver
                    .wait(
                        until.elementIsVisible(
                            this.driver.wait(until.elementLocated(By.css('div#customNetwork')), this.wait)
                        ),
                        this.wait
                    )
                    .findElement(By.css('input#node_address'))
                    .sendKeys(validNodeUrl);

                await this.driver.findElement(By.css('button#networkSettingsSave')).click();

                await expectNetworkChangedTo.call(this, customNetwork);
            });

            describe('Changing network settings by "Edit" button', function () {
                let nodeAddressInput: WebElement,
                    nodeAddressError: WebElement,
                    matcherAddressInput: WebElement,
                    saveAndApplyBtn: WebElement;

                before(async function () {
                    await this.driver
                        .wait(until.elementLocated(By.xpath("//div[contains(@class,'-network-editBtn')]")))
                        .click();

                    await this.driver.wait(
                        until.elementIsVisible(
                            this.driver.wait(until.elementLocated(By.css('div#customNetwork')), this.wait)
                        ),
                        this.wait
                    );

                    nodeAddressInput = this.driver.findElement(By.css('input#node_address'));
                    nodeAddressError = this.driver.findElement(
                        By.xpath(
                            "//input[@id='node_address']//following-sibling::div[contains(@class, '-error-error')]"
                        )
                    );
                    matcherAddressInput = this.driver.findElement(By.css('input#matcher_address'));
                    saveAndApplyBtn = this.driver.findElement(By.css('button#networkSettingsSave'));
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
                                    By.xpath(
                                        "//input[@id='node_address']//following-sibling::div[contains(@class, '-error-error')]"
                                    )
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
                            until.elementLocated(By.xpath("//div[contains(@class,'-network-editBtn')]"))
                        )
                    ).not.to.be.throw;
                });
            });
        });
    });
});
