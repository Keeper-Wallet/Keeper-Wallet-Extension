import { App, CreateNewAccount } from './utils/actions';
import { By, until, WebElement } from 'selenium-webdriver';
import { expect } from 'chai';
import { CUSTOMLIST, WHITELIST } from './utils/constants';

const SPENDING_LIMIT = '1',
    MODAL_FADE_ANIMATION_DELAY = 600,
    PAGE_LOAD_DELAY = 500;

describe('Settings', function () {
    this.timeout(5 * 60 * 1000);

    before(async function () {
        await App.initVault.call(this);
        await CreateNewAccount.importAccount.call(this, 'rich', 'waves private node seed with waves tokens');

        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
            .click();

        await this.driver.wait(
            until.elementLocated(By.xpath("//div[contains(@class, '-settings-content')]")),
            this.wait
        );
    });

    after(async function () {
        await App.resetVault.call(this);
    });

    describe('Network', function () {
        let nodeUrlInput: WebElement,
            matcherUrlInput: WebElement,
            setDefaultBtn: WebElement,
            nodeUrl: string,
            matcherUrl: string;

        before(async function () {
            await this.driver.wait(until.elementLocated(By.css('button#settingsNetwork')), this.wait).click();

            await this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-settings-networkTab')]")),
                this.wait
            );

            nodeUrlInput = this.driver.wait(until.elementLocated(By.css('input#node_address')), this.wait);
            matcherUrlInput = this.driver.findElement(By.css('input#matcher_address'));
            setDefaultBtn = this.driver.findElement(By.css('button#setDefault'));

            nodeUrl = await nodeUrlInput.getAttribute('value');
            matcherUrl = await matcherUrlInput.getAttribute('value');
        });

        after(async function () {
            await this.driver.findElement(By.css('div.arrow-back-icon')).click();
        });

        describe('Node URL', function () {
            it('Is shown', async function () {
                expect(nodeUrl).not.to.be.empty;
            });
            it('Can be changed', async function () {
                await nodeUrlInput.clear();
                expect(await nodeUrlInput.getText()).not.to.be.equal(nodeUrl);
            });
            it('Can be copied');
        });

        describe('Matcher URL', function () {
            it('Is shown', async function () {
                expect(matcherUrl).not.to.be.empty;
            });
            it('Can be changed', async function () {
                await matcherUrlInput.clear();
                expect(await matcherUrlInput.getAttribute('value')).not.to.be.equal(matcherUrlInput);
            });
            it('Can be copied');
        });

        describe('Set default', function () {
            it('Resets Node and Matcher URLs', async function () {
                await setDefaultBtn.click();
                expect(await nodeUrlInput.getAttribute('value')).to.be.equal(nodeUrl);
                expect(await matcherUrlInput.getAttribute('value')).to.be.equal(matcherUrl);
            });
        });
    });

    describe('Permissions control', function () {
        before(async function () {
            await this.driver.wait(until.elementLocated(By.css('button#settingsPermission')), this.wait).click();
        });

        after(async function () {
            await this.driver.findElement(By.css('div.arrow-back-icon')).click();
        });

        const checkChangingAutoLimitsInResourceSettings = () => {
            describe('Changing auto-limits in resource settings', function () {
                let originSettingsModal: WebElement,
                    resolutionTimeSelect: WebElement,
                    spendingLimitInput: WebElement,
                    saveBtn: WebElement;

                beforeEach(async function () {
                    await this.driver
                        .findElement(
                            By.xpath(
                                "//div[contains(@class, '-list-permissionItem')]//button[contains(@class, '-list-settings')]"
                            )
                        )
                        .click();

                    originSettingsModal = this.driver.findElement(
                        By.xpath("//div[contains(@class, '-settings-settings')]")
                    );
                    await this.driver.wait(until.elementIsVisible(originSettingsModal), this.wait);

                    resolutionTimeSelect = this.driver.findElement(
                        By.xpath(
                            "//div[contains(@class, '-settings-selectTime')]" +
                                "//div[contains(@class, '-index-selectInput')]"
                        )
                    );
                    spendingLimitInput = this.driver.findElement(
                        By.xpath("//input[contains(@class, '-settings-amountInput')]")
                    );

                    saveBtn = this.driver.findElement(By.css('button#save'));
                });

                it('Enabling', async function () {
                    await resolutionTimeSelect.click();
                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-index-listItem')][last()]")),
                            this.wait
                        )
                        .click();
                    await this.driver
                        .wait(until.elementIsEnabled(spendingLimitInput), this.wait)
                        .sendKeys(SPENDING_LIMIT);
                    await this.driver.wait(until.elementIsEnabled(saveBtn), this.wait).click();
                    await this.driver.sleep(MODAL_FADE_ANIMATION_DELAY);
                    await this.driver.wait(until.elementIsNotVisible(originSettingsModal), this.wait);
                    expect(
                        await this.driver
                            .wait(
                                until.elementLocated(
                                    By.xpath(
                                        "//div[contains(@class, '-list-permissionItem')]" +
                                            "//div[contains(@class, '-list-statusColor')]" +
                                            '//span'
                                    )
                                ),
                                this.wait
                            )
                            .getText()
                    ).matches(/automatic signing/i);
                });

                it('Disabling', async function () {
                    await resolutionTimeSelect.click();
                    await this.driver
                        .wait(until.elementLocated(By.xpath("//div[contains(@class, '-index-listItem')]")), this.wait)
                        .click();
                    await this.driver.wait(until.elementIsEnabled(saveBtn), this.wait).click();
                    await this.driver.sleep(MODAL_FADE_ANIMATION_DELAY);
                    await this.driver.wait(until.elementIsNotVisible(originSettingsModal), this.wait);
                    expect(
                        await this.driver.findElements(
                            By.xpath(
                                "//div[contains(@class, '-list-permissionItem')]" +
                                    "//div[contains(@class, '-list-statusColor')]" +
                                    '//span'
                            )
                        )
                    ).length(0);
                });
            });
        };

        describe('White list', function () {
            before(async function () {
                await this.driver.wait(until.elementLocated(By.css('div#whiteListTab')), this.wait).click();

                await this.driver.wait(
                    until.elementLocated(By.xpath("//div[@id='whiteListTab'][contains(@class, '-index-selected')]"))
                );
            });

            it('Default whitelisted services appears', async function () {
                for (const origin of WHITELIST) {
                    expect(
                        await this.driver.findElements(
                            By.xpath(`//div[contains(@class, '-list-permissionItem')]//div[text()='${origin}']`)
                        )
                    ).length(1);
                }
            });

            checkChangingAutoLimitsInResourceSettings();

            describe('Verification of transactions with auto-limits', function () {
                it('Transfer');
                it('MassTransfer');
                it('Data');
                it('InvokeScript');
            });
        });

        describe('Custom list', function () {
            async function publicStateFromOrigin(origin: string) {
                // this requests permission first
                const permissionRequest = () => {
                    // @ts-ignore
                    WavesKeeper.initialPromise.then((api) => {
                        api.publicState().then(
                            (resolved) => {
                                // @ts-ignore
                                window.result = resolved;
                            },
                            (rejected) => {
                                // @ts-ignore
                                window.result = rejected;
                            }
                        );
                    });
                };

                await this.driver.get(`https://${origin}`);
                await this.driver.sleep(PAGE_LOAD_DELAY);
                return await this.driver.executeScript(permissionRequest);
            }

            describe('Adding', function () {
                it('Origin added to custom list', async function () {
                    const origin = CUSTOMLIST[0];
                    await publicStateFromOrigin.call(this, origin);

                    await this.driver.get(this.extensionUrl);
                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-originAuth-transaction')]")),
                        this.wait
                    );
                    await this.driver.findElement(By.css('button#approve')).click();

                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-transactions-txFinal')]")),
                        this.wait
                    );
                    await this.driver.findElement(By.css('button#close')).click();

                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")),
                            this.wait
                        )
                        .click();

                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-settings-content')]")),
                        this.wait
                    );
                    await this.driver
                        .wait(until.elementLocated(By.css('button#settingsPermission')), this.wait)
                        .click();

                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-list-permissionList')]")),
                            this.wait
                        )
                        .findElements(
                            By.xpath(`//div[contains(@class, '-list-permissionItem')]//div[text()='${origin}']`)
                        );
                });

                it('Origin added to custom list with auto-limits', async function () {
                    const origin = CUSTOMLIST[1];
                    await publicStateFromOrigin.call(this, origin);

                    await this.driver.get(this.extensionUrl);
                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-originAuth-transaction')]")),
                        this.wait
                    );
                    await this.driver
                        .findElement(
                            By.xpath(
                                "//div[contains(@class, '-originAuth-collapsed')]//div[contains(@class, '-index-title')]"
                            )
                        )
                        .click();

                    await this.driver.sleep(MODAL_FADE_ANIMATION_DELAY);

                    this.driver
                        .findElement(
                            By.xpath(
                                "//div[contains(@class, '-settings-selectTime')]" +
                                    "//div[contains(@class, '-index-selectInput')]"
                            )
                        )
                        .click();

                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-index-listItem')][last()]")),
                            this.wait
                        )
                        .click();

                    await this.driver
                        .wait(
                            until.elementIsEnabled(
                                this.driver.findElement(By.xpath("//input[contains(@class, '-settings-amountInput')]"))
                            ),
                            this.wait
                        )
                        .sendKeys(SPENDING_LIMIT);

                    await this.driver.findElement(By.css('button#approve')).click();

                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-transactions-txFinal')]")),
                        this.wait
                    );
                    await this.driver.findElement(By.css('button#close')).click();

                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")),
                            this.wait
                        )
                        .click();

                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-settings-content')]")),
                        this.wait
                    );
                    await this.driver
                        .wait(until.elementLocated(By.css('button#settingsPermission')), this.wait)
                        .click();

                    expect(
                        await this.driver
                            .wait(
                                until.elementLocated(By.xpath("//div[contains(@class, '-list-permissionList')]")),
                                this.wait
                            )
                            .findElements(
                                By.xpath(
                                    `//div[contains(@class, '-list-permissionItem')][./div[text()='${origin}']]//span`
                                )
                            )
                    ).length(1);
                });
            });

            describe('Blocking', function () {
                after(async function () {
                    await this.driver.get(this.extensionUrl);

                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")),
                            this.wait
                        )
                        .click();

                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-settings-content')]")),
                        this.wait
                    );
                    await this.driver
                        .wait(until.elementLocated(By.css('button#settingsPermission')), this.wait)
                        .click();
                });

                it('Block all messages from origin in custom list', async function () {
                    // here we have 2 enabled origins
                    const originEl: WebElement = await this.driver.findElement(
                        By.xpath("//div[contains(@class, '-list-permissionItem')]")
                    );
                    const origin: string = await originEl.findElement(By.css('div')).getText();

                    await originEl.findElement(By.xpath("//button[contains(@class, '-list-enable')]")).click();

                    await this.driver.wait(
                        until.elementLocated(By.xpath("//button[contains(@class, '-list-disable')]")),
                        this.wait
                    );

                    await publicStateFromOrigin.call(this, origin);
                    const response = await this.driver.executeScript(() => {
                        // @ts-ignore
                        return window.result;
                    });
                    expect(response).to.be.deep.equal({ message: 'Api rejected by user', code: '12', data: null });
                });
            });

            describe('Removing', function () {
                after(async function () {
                    await this.driver.get(this.extensionUrl);

                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")),
                            this.wait
                        )
                        .click();

                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-settings-content')]")),
                        this.wait
                    );
                    await this.driver
                        .wait(until.elementLocated(By.css('button#settingsPermission')), this.wait)
                        .click();
                });

                it('After deletion, requests generate permission request', async function () {
                    // here we have 2 origins, the first one is disabled, so we will delete it
                    const originEl: WebElement = await this.driver.findElement(
                        By.xpath("//div[contains(@class, '-list-permissionItem')]")
                    );

                    const origin: string = await originEl.findElement(By.css('div')).getText();
                    await originEl.findElement(By.xpath("//button[contains(@class, '-list-settings')]")).click();

                    const originSettingsModal = this.driver.findElement(
                        By.xpath("//div[contains(@class, '-settings-settings')]")
                    );
                    await this.driver.wait(until.elementIsVisible(originSettingsModal), this.wait);
                    this.driver.findElement(By.css('button#delete')).click();
                    await this.driver.sleep(MODAL_FADE_ANIMATION_DELAY);
                    await this.driver.wait(until.elementIsNotVisible(originSettingsModal), this.wait);

                    await publicStateFromOrigin.call(this, origin);

                    await this.driver.get(this.extensionUrl);
                    expect(
                        await this.driver.wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-originAuth-transaction')]")),
                            this.wait
                        )
                    ).not.to.be.throw;
                    await this.driver.findElement(By.css('button#reject')).click();
                });
            });

            checkChangingAutoLimitsInResourceSettings();

            describe('Verification of transactions with auto-limits', function () {
                it('Transfer');
                it('MassTransfer');
                it('Data');
                it('InvokeScript');
            });
        });
    });

    describe('General', function () {
        before(async function () {
            await this.driver.wait(until.elementLocated(By.css('button#settingsGeneral')), this.wait).click();
        });

        describe('Auto-click protection', function () {
            it('Can be enabled');
            it('Can be disabled');
            it('Display tooltip');
        });

        describe('Logout', function () {
            // todo after() login
            it('Exit to the login screen');
        });

        describe('Session Timeout', function () {
            // todo afterEach() login
            it('Logout after "Browser timeout"');
            it('Logout after 5 min / 10 min / 1 hour');
        });

        describe('Delete accounts', function () {
            it('Account deletion warning displays');
            it('Clicking "Back" button cancels the deletion');
            it('Clicking "Delete account" removes all accounts from current network');
        });
    });
});
