import { By, Key, until, WebElement } from 'selenium-webdriver';
import { expect } from 'chai';
import { clear } from './utils';
import { resetWavesKeeperVault } from './utils/actions';

describe('Account management', function () {
    this.timeout(60 * 1000);

    before(async function () {
        // init Waves Keeper vault before this tests
        const password = 'valid-password';

        await this.driver.get(this.extensionUrl);
        // Get Started page
        await this.driver.wait(until.elementLocated(By.css('.app button[type=submit]')), this.wait).click();
        // Protect Your Account page
        await this.driver
            .wait(until.elementLocated(By.css('.app input#first[type=password]')), this.wait)
            .sendKeys(password);
        await this.driver.findElement(By.css('.app input#second[type=password]')).sendKeys(password);
        await this.driver.findElement(By.css('.app input#termsAccepted[type=checkbox]')).click();
        await this.driver.findElement(By.css('.app input#conditionsAccepted[type=checkbox]')).click();
        await this.driver
            .wait(until.elementIsEnabled(this.driver.findElement(By.css('.app button[type=submit]'))), this.wait)
            .click();
        // Create new account page
        await this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, '-import-import')]")), this.wait);
    });

    after(async function () {
        resetWavesKeeperVault.call(this);
    });

    describe('Create account', function () {
        const ACCOUNTS = { FIRST: 'first', SECOND: 'second', ANY: 'account123!@#_аккаунт' };
        const PILL_ANIMATION_DELAY = 200;

        after(async function () {
            // delete all created accounts
            while (true) {
                let form: WebElement = await this.driver.wait(
                    until.elementLocated(
                        By.xpath("//div[(contains(@class, '-assets-assets') or contains(@class, '-import-import'))]")
                    ),
                    this.wait
                );
                let activeWalletEl: WebElement[] = await form.findElements(
                    By.xpath(
                        "//div[contains(@class, '-wallet-activeWallet')]" +
                            "//div[contains(@class, '-wallet-accountName')]"
                    )
                );

                if (!activeWalletEl.length) {
                    break;
                }

                await activeWalletEl[0].click();

                await this.driver
                    .wait(
                        until.elementLocated(By.xpath("//div[contains(@class, '-accountInfo-deleteButton')]")),
                        this.wait
                    )
                    .click();

                await this.driver.wait(until.elementLocated(By.css('button#deleteAccount')), this.wait).click();
            }
        });

        it('Creating the first account via the "Create a new account" button', async function () {
            await this.driver.findElement(By.css('button#createNewAccount')).click();

            await this.driver.wait(until.elementLocated(By.css('button#continue')), this.wait).click();

            await this.driver
                .wait(until.elementLocated(By.css('input#newAccountName')), this.wait)
                .sendKeys(ACCOUNTS.FIRST);
            await this.driver
                .wait(until.elementIsEnabled(this.driver.findElement(By.css('button#createBackup'))), this.wait)
                .click();

            const seed: string[] = (
                await this.driver.wait(until.elementLocated(By.css('div.cant-select')), this.wait).getText()
            ).split(' ');
            await this.driver.findElement(By.css('button#continue')).click();

            const writePills: WebElement = this.driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class, '-confirmBackup-writeSeed')]")),
                this.wait
            );
            for (const word of seed) {
                await writePills
                    .findElement(
                        By.xpath(
                            "//div[not(contains(@class, '-pills-hidden'))]" +
                                `/div[contains(@class,'-pills-text')][text()='${word}']`
                        )
                    )
                    .click();
                await this.driver.sleep(PILL_ANIMATION_DELAY);
            }
            await this.driver.wait(until.elementLocated(By.css('button#confirmBackup')), this.wait).click();

            expect(
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
                    .getText()
            ).to.be.equals(ACCOUNTS.FIRST);
        });

        describe('Creating an additional account via the "Add account" button', function () {
            describe('When you already have 1 account', function () {
                describe('Create new account page', function () {
                    before(async function () {
                        await this.driver
                            .wait(
                                until.elementLocated(By.xpath("//div[contains(@class, '-assets-addAccount')]")),
                                this.wait
                            )
                            .click();

                        await this.driver
                            .wait(until.elementLocated(By.css('button#createNewAccount')), this.wait)
                            .click();
                    });

                    it('Each time you open the "Create new account" screen, new addresses are generated', async function () {
                        const prevAddress = await this.driver
                            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-newwallet-greyLine')]")))
                            .getText();
                        await this.driver.findElement(By.css('div.arrow-back-icon')).click();

                        await this.driver
                            .wait(until.elementLocated(By.css('button#createNewAccount')), this.wait)
                            .click();

                        expect(
                            await this.driver
                                .wait(until.elementLocated(By.xpath("//div[contains(@class, '-newwallet-greyLine')]")))
                                .getText()
                        ).to.be.not.equal(prevAddress);
                    });

                    it('You can select any account from the list of 5 generated', async function () {
                        const addressEl: WebElement = this.driver.wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-newwallet-greyLine')]"))
                        );
                        let prevAddress = null;
                        const avatarList: WebElement[] = await this.driver.findElements(
                            By.xpath("//div[contains(@class, '-avatar-avatar-')]")
                        );
                        expect(avatarList).length(5);

                        for (const avatar of avatarList) {
                            await avatar.click();
                            const currentAddress = await addressEl.getText();
                            expect(currentAddress).to.be.not.equal(prevAddress);
                            prevAddress = currentAddress;
                        }

                        await this.driver.wait(until.elementLocated(By.css('button#continue')), this.wait).click();
                    });
                });

                describe('Account name page', function () {
                    let accountNameInput: WebElement, createBackupBtn: WebElement;
                    before(function () {
                        accountNameInput = this.driver.wait(
                            until.elementLocated(By.css('input#newAccountName')),
                            this.wait
                        );
                        createBackupBtn = this.driver.findElement(By.css('button#createBackup'));
                    });

                    beforeEach(async function () {
                        await clear(accountNameInput);
                    });

                    it('Account cannot be given a name that is already in use', async function () {
                        await accountNameInput.sendKeys(ACCOUNTS.FIRST);
                        expect(await createBackupBtn.isEnabled()).to.be.false;
                    });

                    it('Ability to paste account name from clipboard');
                    it('In the account name, you can enter numbers, special characters and symbols from any layout', async function () {
                        await accountNameInput.sendKeys(ACCOUNTS.ANY);
                        expect(await createBackupBtn.isEnabled()).to.be.true;
                        await createBackupBtn.click();
                    });
                });

                let rightSeed: string;
                describe('Save backup phrase page', function () {
                    it('After the Keeper is closed, the same screen opens', async function () {
                        rightSeed = await this.driver
                            .wait(until.elementLocated(By.css('div.cant-select')), this.wait)
                            .getText();
                        // reload page equals to close then open
                        await this.driver.get(this.extensionUrl);
                        expect(
                            await this.driver.wait(until.elementLocated(By.css('div.cant-select')), this.wait).getText()
                        ).to.be.equals(rightSeed);
                        await this.driver.findElement(By.css('button#continue')).click();
                    });

                    it('Backup phrase cannot be selected with cursor');
                    it('Ability to copy backup phrase to clipboard');
                });

                describe('Confirm backup page', function () {
                    let clearButton: WebElement, wrongSeed: string[];
                    it('Filling in a seed in the wrong word order', async function () {
                        // there is no Confirm button. An error message and a "Clear" button are displayed
                        wrongSeed = rightSeed.split(' ').reverse();
                        const seedPills: WebElement = await this.driver.wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-confirmBackup-writeSeed')]")),
                            this.wait
                        );
                        for (const word of wrongSeed) {
                            await seedPills
                                .findElement(By.xpath(`//div[contains(@class,'-pills-text')][text()='${word}']`))
                                .click();
                            await this.driver.sleep(PILL_ANIMATION_DELAY);
                        }
                        const errorDiv: WebElement = this.driver.wait(
                            until.elementLocated(By.xpath("//div[contains(@class,'-error-error')]"))
                        );
                        expect(await errorDiv.isDisplayed()).to.be.true;
                        expect(await errorDiv.getText()).is.not.empty;
                        clearButton = this.driver.findElement(
                            By.xpath("//div[contains(@class, '-confirmBackup-clearSeed')]")
                        );
                        expect(
                            await this.driver
                                .findElement(By.xpath("//div[contains(@class, '-confirmBackup-clearSeed')]"))
                                .isDisplayed()
                        ).to.be.true;
                    });

                    it('The "Clear" button resets a completely filled phrase', async function () {
                        await clearButton.click();
                        expect(
                            await this.driver
                                .findElement(By.xpath("//div[contains(@class,'-error-error')]"))
                                .isDisplayed()
                        ).to.be.false;
                        expect(
                            await this.driver.findElements(
                                By.xpath("//div[contains(@class, '-confirmBackup-clearSeed')]")
                            )
                        ).to.be.empty;
                    });

                    it('The "Clear" button resets a partially filled phrase', function () {
                        this.skip();
                        // FIXME ui doesnt show the "Clear" button if the phrase is partially filled
                    });

                    it('The word can be reset by clicking (any, not only the last)', async function () {
                        const writePills: WebElement[] = await this.driver.wait(
                            until.elementsLocated(
                                By.xpath(
                                    "//div[contains(@class, '-confirmBackup-writeSeed')]" +
                                        "//div[not(contains(@class, '-pills-hidden'))]" +
                                        "/div[contains(@class,'-pills-text')]"
                                )
                            ),
                            this.wait
                        );
                        for (const pill of writePills) {
                            await pill.click();
                            await this.driver.sleep(PILL_ANIMATION_DELAY);
                        }
                        await this.driver.wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-confirmBackup-clearSeed')]")),
                            this.wait
                        );
                        expect(
                            await this.driver.findElements(
                                By.xpath(
                                    "//div[contains(@class, '-confirmBackup-writeSeed')]" +
                                        "//div[not(contains(@class, '-pills-hidden'))]" +
                                        "/div[contains(@class,'-pills-text')]"
                                )
                            )
                        ).to.be.empty;

                        const readPills: WebElement[] = await this.driver.findElements(
                            By.xpath(
                                "//div[contains(@class, '-confirmBackup-readSeed')]" +
                                    "//div[not(contains(@class, '-pills-hidden'))]" +
                                    "/div[contains(@class,'-pills-text')]"
                            )
                        );
                        for (const pill of readPills) {
                            await pill.click();
                            await this.driver.sleep(PILL_ANIMATION_DELAY);
                        }

                        expect(
                            await this.driver.findElements(
                                By.xpath(
                                    "//div[contains(@class, '-confirmBackup-readSeed')]" +
                                        "//div[not(contains(@class, '-pills-hidden'))]" +
                                        "/div[contains(@class,'-pills-text')]"
                                )
                            )
                        ).to.be.empty;
                    });

                    it('Additional account successfully created while filling in the phrase in the correct order', async function () {
                        const writePills: WebElement = this.driver.wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-confirmBackup-writeSeed')]")),
                            this.wait
                        );
                        for (const word of rightSeed.split(' ')) {
                            await writePills
                                .findElement(
                                    By.xpath(
                                        "//div[not(contains(@class, '-pills-hidden'))]" +
                                            `/div[contains(@class,'-pills-text')][text()='${word}']`
                                    )
                                )
                                .click();
                            await this.driver.sleep(PILL_ANIMATION_DELAY);
                        }
                        await this.driver.wait(until.elementLocated(By.css('button#confirmBackup')), this.wait).click();

                        expect(
                            await this.driver
                                .wait(
                                    until.elementIsVisible(
                                        this.driver.wait(
                                            until.elementLocated(
                                                By.xpath(
                                                    "//div[contains(@class, '-assets-assets')]" +
                                                        "//div[contains(@class, 'wallets-list')]" +
                                                        "//div[contains(@class, '-wallet-accountName')]"
                                                )
                                            ),
                                            this.wait
                                        )
                                    ),
                                    this.wait
                                )
                                .getText()
                        ).to.be.equals(ACCOUNTS.ANY);
                    });
                });
            });

            it('When you already have 2 accounts');

            it('When you already have 10 accounts');
        });
    });

    describe('Import account', function () {
        const ACCOUNTS = {
            FIRST: { SEED: 'this is first account seed', NAME: 'first' },
            MORE_25_CHARS: { SEED: 'there is more than 25 characters', NAME: 'more than 25 characters' },
            LESS_25_CHARS: { SEED: 'too short seed', NAME: 'short' },
        };

        it('Importing the first account via the "Import account" button', async function () {
            await this.driver
                .wait(until.elementLocated(By.xpath("//div[contains(@class,'-import-importChooser')]")), this.wait)
                .click();

            await this.driver
                .wait(
                    until.elementLocated(By.xpath("//div[contains(@class, '-importSeed-content')]//textarea")),
                    this.wait
                )
                .sendKeys(ACCOUNTS.FIRST.SEED);
            await this.driver
                .wait(until.elementIsEnabled(this.driver.findElement(By.css('button#importAccount'))), this.wait)
                .click();

            await this.driver
                .wait(until.elementLocated(By.css('input#newAccountName')), this.wait)
                .sendKeys(ACCOUNTS.FIRST.NAME);
            await this.driver
                .wait(until.elementIsEnabled(this.driver.findElement(By.css('button#continue'))), this.wait)
                .click();

            expect(
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
                    .getText()
            ).to.be.equals(ACCOUNTS.FIRST.NAME);
        });

        describe('Importing an additional account via the "Add account" button', function () {
            describe('When you already have 1 account', function () {
                before(async function () {
                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-assets-addAccount')]")),
                            this.wait
                        )
                        .click();

                    await this.driver
                        .wait(
                            until.elementLocated(By.xpath("//div[contains(@class,'-import-importChooser')]")),
                            this.wait
                        )
                        .click();
                });
                describe('Welcome back page', function () {
                    let seedTextarea: WebElement, importAccountBtn: WebElement, currentAddressDiv: WebElement;

                    before(function () {
                        seedTextarea = this.driver.wait(
                            until.elementLocated(By.xpath("//div[contains(@class, '-importSeed-content')]//textarea")),
                            this.wait
                        );
                        importAccountBtn = this.driver.findElement(By.css('button#importAccount'));
                        currentAddressDiv = this.driver.findElement(
                            By.xpath("//div[contains(@class, '-importSeed-greyLine')]")
                        );
                    });

                    beforeEach(async function () {
                        await clear(seedTextarea);
                    });

                    it("Can't import seed with length less than 25 characters", async function () {
                        await seedTextarea.sendKeys(ACCOUNTS.LESS_25_CHARS.SEED);
                        await seedTextarea.sendKeys('\t'); // fire blur event
                        expect(await importAccountBtn.isEnabled()).to.be.false;
                    });

                    it("Can't import seed for an already added account", async function () {
                        await seedTextarea.sendKeys(ACCOUNTS.FIRST.SEED);
                        await seedTextarea.sendKeys('\t');
                        expect(
                            await this.driver.wait(
                                until.elementLocated(
                                    By.xpath(
                                        "//div[contains(@class, '-importSeed-content')]//textarea" +
                                            "//following-sibling::div[contains(@class, '-error-error')]"
                                    )
                                ),
                                this.wait
                            )
                        ).to.be.not.empty;
                    });

                    it('Any change in the seed changes the address', async function () {
                        let lastAddress: string = null,
                            currentAddress: string;
                        // input seed
                        await seedTextarea.sendKeys(ACCOUNTS.MORE_25_CHARS.SEED);
                        currentAddress = await currentAddressDiv.getText();
                        expect(currentAddress).to.be.not.equal(lastAddress);
                        lastAddress = currentAddress;
                        // insert char
                        await seedTextarea.sendKeys('W');
                        currentAddress = await currentAddressDiv.getText();
                        expect(currentAddress).to.be.not.equal(lastAddress);
                        lastAddress = currentAddress;
                        // delete inserted char
                        await seedTextarea.sendKeys(Key.BACK_SPACE);
                        expect(await currentAddressDiv.getText()).to.be.not.equal(lastAddress);
                    });

                    it('You can paste a seed from the clipboard');

                    it('Correct seed entered', async function () {
                        await seedTextarea.sendKeys(ACCOUNTS.MORE_25_CHARS.SEED);
                        expect(await importAccountBtn.isEnabled()).to.be.true;
                        await importAccountBtn.click();
                    });
                });

                describe('Account name page', function () {
                    let accountNameInput: WebElement, continueBtn: WebElement;

                    before(function () {
                        accountNameInput = this.driver.wait(
                            until.elementLocated(By.css('input#newAccountName')),
                            this.wait
                        );
                        continueBtn = this.driver.findElement(By.css('button#continue'));
                    });

                    beforeEach(async function () {
                        await clear(accountNameInput);
                    });

                    it('The account cannot be given a name already in use', async function () {
                        await accountNameInput.sendKeys(ACCOUNTS.FIRST.NAME);
                        await accountNameInput.sendKeys('\t');
                        expect(
                            await this.driver
                                .wait(
                                    until.elementLocated(
                                        By.xpath(
                                            "//input[@id='newAccountName']" +
                                                "//following-sibling::div[contains(@class, '-error-error')]"
                                        )
                                    ),
                                    this.wait
                                )
                                .getText()
                        ).matches(/Name already exist/i);
                        expect(await continueBtn.isEnabled()).to.be.false;
                    });

                    it('Additional account successfully imported while entered correct account name', async function () {
                        await accountNameInput.sendKeys(ACCOUNTS.MORE_25_CHARS.NAME);
                        await accountNameInput.sendKeys('\t');
                        expect(await continueBtn.isEnabled()).to.be.true;
                        await continueBtn.click();

                        expect(
                            await this.driver
                                .wait(
                                    until.elementIsVisible(
                                        this.driver.wait(
                                            until.elementLocated(
                                                By.xpath(
                                                    "//div[contains(@class, '-assets-assets')]" +
                                                        "//div[contains(@class, 'wallets-list')]" +
                                                        "//div[contains(@class, '-wallet-accountName')]"
                                                )
                                            ),
                                            this.wait
                                        )
                                    ),
                                    this.wait
                                )
                                .getText()
                        ).to.be.equals(ACCOUNTS.MORE_25_CHARS.NAME);
                    });
                });
            });

            it('When you already have 2 accounts');

            it('When you already have 10 accounts');
        });
    });
});
