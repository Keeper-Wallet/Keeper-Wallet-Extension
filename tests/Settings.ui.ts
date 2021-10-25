import { App, CreateNewAccount, Network, Settings } from './utils/actions';
import { By, until, WebElement } from 'selenium-webdriver';
import { expect } from 'chai';
import {
    CUSTOMLIST,
    DEFAULT_ANIMATION_DELAY,
    DEFAULT_PAGE_LOAD_DELAY,
    DEFAULT_PASSWORD,
    WHITELIST,
} from './utils/constants';

const SPENDING_LIMIT = '1',
    BROWSER_TIMEOUT_DELAY = 60 * 1000 + DEFAULT_ANIMATION_DELAY;

describe('Settings', function () {
    this.timeout(BROWSER_TIMEOUT_DELAY + 60 * 1000);

    async function performLogin(password: string) {
        const passwordEls = await this.driver.findElements(By.css('input#loginPassword'));

        if (passwordEls.length) {
            await passwordEls[0].sendKeys(password);
            await this.driver
                .wait(until.elementIsEnabled(this.driver.findElement(By.css('button#loginEnter'))), this.wait)
                .click();
        }
    }

    before(async function () {
        await App.initVault.call(this, DEFAULT_PASSWORD);
        await CreateNewAccount.importAccount.call(this, 'rich', 'waves private node seed with waves tokens');
        await Settings.setMaxSessionTimeout.call(this);

        await App.open.call(this);
        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
            .click();

        await this.driver.wait(
            until.elementLocated(By.xpath("//div[contains(@class, '-settings-content')]")),
            this.wait
        );
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
            matcherUrlInput = this.driver.wait(until.elementLocated(By.css('input#matcher_address')), this.wait);
            setDefaultBtn = this.driver.wait(until.elementLocated(By.css('button#setDefault')), this.wait);

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
                expect(await matcherUrlInput.getAttribute('value')).not.to.be.equal(matcherUrl);
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
                let resolutionTimeSelect: WebElement, spendingLimitInput: WebElement, saveBtn: WebElement;

                beforeEach(async function () {
                    await this.driver
                        .findElement(
                            By.xpath(
                                "//div[contains(@class, '-list-permissionItem')]//button[contains(@class, '-list-settings')]"
                            )
                        )
                        .click();

                    await this.driver.wait(
                        until.elementIsVisible(
                            this.driver.wait(until.elementLocated(By.css('div#originSettings')), this.wait)
                        ),
                        this.wait
                    );

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
                    await this.driver.sleep(DEFAULT_ANIMATION_DELAY);
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
                    await this.driver.sleep(DEFAULT_ANIMATION_DELAY);
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
                await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
                return await this.driver.executeScript(permissionRequest);
            }

            after(async function () {
                await App.open.call(this);
                await Settings.clearCustomList.call(this);
            });

            describe('Adding', function () {
                it('Origin added to custom list', async function () {
                    const origin = CUSTOMLIST[0];
                    await publicStateFromOrigin.call(this, origin);

                    await App.open.call(this);
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

                    await App.open.call(this);
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

                    await this.driver.sleep(DEFAULT_ANIMATION_DELAY);

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
                    await App.open.call(this);

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
                    await App.open.call(this);

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

                    await this.driver.wait(
                        until.elementIsVisible(
                            this.driver.wait(until.elementLocated(By.css('div#originSettings')), this.wait)
                        ),
                        this.wait
                    );
                    this.driver.findElement(By.css('button#delete')).click();
                    await this.driver.sleep(DEFAULT_ANIMATION_DELAY);

                    await publicStateFromOrigin.call(this, origin);

                    await App.open.call(this);
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

        after(async function () {
            await this.driver.findElement(By.css('div.arrow-back-icon')).click();
        });

        describe('Session Timeout', function () {
            afterEach(async function () {
                await performLogin.call(this, DEFAULT_PASSWORD);

                await this.driver.wait(
                    until.elementLocated(By.xpath("//div[contains(@class, '-settings-content')]")),
                    this.wait
                );
            });

            it('Logout after "Browser timeout"', async function () {
                await App.open.call(this);
                await Settings.setMinSessionTimeout.call(this);

                expect(
                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-login-content')]")),
                        BROWSER_TIMEOUT_DELAY
                    )
                ).not.to.be.throw;
            });

            it('Logout after 5 min / 10 min / 1 hour');
        });
    });

    describe('Root', function () {
        describe('Auto-click protection', function () {
            let clickProtectionDiv: WebElement,
                toggleBtn: WebElement,
                statusSpan: WebElement,
                helpIcon: WebElement,
                helpTooltip: WebElement;

            before(async function () {
                clickProtectionDiv = this.driver.wait(
                    until.elementLocated(By.xpath("//div[contains(@class, '-settings-clickProtection')]")),
                    this.wait
                );
                toggleBtn = clickProtectionDiv.findElement(
                    By.xpath("//button[contains(@class, '-powerBtn-powerBtn')]")
                );
                statusSpan = clickProtectionDiv.findElement(
                    By.xpath("//div[contains(@class, '-settings-powerBtnState')]//div//span")
                );
                helpIcon = clickProtectionDiv.findElement(By.xpath("//i[contains(@class, '-settings-helpIcon')]"));
                helpTooltip = clickProtectionDiv.findElement(By.xpath("//div[contains(@class, '-settings-tooltip')]"));
            });

            it('Can be enabled', async function () {
                await toggleBtn.click();
                await this.driver.sleep(DEFAULT_ANIMATION_DELAY);
                expect(
                    await clickProtectionDiv.findElements(
                        By.xpath("//button[contains(@class, '-powerBtn-powerBtnOn')]")
                    )
                ).length(1);
                expect(await statusSpan.getText()).matches(/enabled/i);
            });

            it('Can be disabled', async function () {
                await toggleBtn.click();
                await this.driver.sleep(DEFAULT_ANIMATION_DELAY);
                expect(
                    await clickProtectionDiv.findElements(
                        By.xpath("//button[contains(@class, '-powerBtn-powerBtnOn')]")
                    )
                ).length(0);
                expect(await statusSpan.getText()).matches(/disabled/i);
            });

            it('Display tooltip', async function () {
                const actions = this.driver.actions({ async: true });
                await actions.move({ origin: helpIcon }).perform();
                expect(await helpTooltip.isDisplayed()).to.be.true;
            });
        });

        describe('Logout', function () {
            after(async function () {
                await performLogin.call(this, DEFAULT_PASSWORD);

                await this.driver
                    .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
                    .click();
            });

            it('Exit to the login screen', async function () {
                await this.driver.findElement(By.xpath("//div[contains(@class, '-settings-logout')]")).click();

                expect(
                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-login-content')]")),
                        this.wait
                    )
                ).not.to.be.throw;
            });
        });

        describe('Delete accounts', function () {
            it('Account deletion warning displays', async function () {
                await this.driver.findElement(By.xpath("//div[contains(@class, '-settings-deleteAccounts')]")).click();

                expect(
                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-deleteAccount-content')]")),
                        this.wait
                    )
                ).not.to.be.throw;
            });

            it('Clicking "Back" button cancels the deletion', async function () {
                await this.driver.findElement(By.css('div.arrow-back-icon')).click();

                expect(
                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-settings-content')]")),
                        this.wait
                    )
                ).not.to.be.throw;
            });

            it('Clicking "Delete account" removes all accounts from current network', async function () {
                await this.driver.findElement(By.xpath("//div[contains(@class, '-settings-deleteAccounts')]")).click();

                await this.driver.wait(until.elementLocated(By.css('button#deleteAccount')), this.wait).click();

                expect(
                    await this.driver.wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-welcome-content')]")),
                        this.wait
                    )
                ).not.to.be.throw;
            });
        });
    });
});
