import { By, Key, until, WebElement } from 'selenium-webdriver';
import { expect } from 'chai';

describe('Account management', function () {
    this.timeout(60 * 1000);

    before(async function () {
        // init Waves Keeper vault before this tests
        const password = 'valid-password';

        await this.driver.get(`chrome-extension://${this.extension.id}/popup.html`);
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
        // reset Waves Keeper vault
        await this.driver.get(`chrome-extension://${this.extension.id}/popup.html`);
        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-menu-settingsIcon')]")), this.wait)
            .click();

        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-settings-deleteAccounts')]")), this.wait)
            .click();

        await this.driver.wait(until.elementLocated(By.css('button#deleteAccount')), this.wait).click();
    });

    describe('Create account', function () {
        const ACCOUNTS = { FIRST: 'first', SECOND: 'second', ANY: 'account123!@#_аккаунт' };
        const PILL_ANIMATION_DELAY = 300;

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

        describe('Creating an additional account via the "Add account" button', () => {
            describe('When you already have 1 account', () => {
                describe('Create new account page', () => {
                    it('Each time you open the "Create new account" screen, new addresses are generated', async function () {
                        await this.driver
                            .wait(
                                until.elementLocated(By.xpath("//div[contains(@class, '-assets-addAccount')]")),
                                this.wait
                            )
                            .click();

                        await this.driver
                            .wait(until.elementLocated(By.css('button#createNewAccount')), this.wait)
                            .click();

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

                describe('Account name page', () => {
                    let accountNameInput, createBackupBtn;
                    it('Account cannot be given a name that is already in use', async function () {
                        accountNameInput = this.driver.wait(
                            until.elementLocated(By.css('input#newAccountName')),
                            this.wait
                        );
                        await accountNameInput.sendKeys(ACCOUNTS.FIRST);
                        createBackupBtn = this.driver.findElement(By.css('button#createBackup'));
                        expect(await createBackupBtn.isEnabled()).to.be.false;
                    });

                    it('Ability to paste account name from clipboard');
                    it('In the account name, you can enter numbers, special characters and symbols from any layout', async function () {
                        await accountNameInput.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END), Key.BACK_SPACE);
                        await accountNameInput.sendKeys(ACCOUNTS.ANY);
                        expect(await createBackupBtn.isEnabled()).to.be.true;
                        await createBackupBtn.click();
                    });
                });

                let rightSeed: string;
                describe('Save backup phrase page', () => {
                    it('After the Keeper is closed, the same screen opens', async function () {
                        rightSeed = await this.driver
                            .wait(until.elementLocated(By.css('div.cant-select')), this.wait)
                            .getText();
                        // reload page equals to close then open
                        await this.driver.get(`chrome-extension://${this.extension.id}/popup.html`);
                        expect(
                            await this.driver.wait(until.elementLocated(By.css('div.cant-select')), this.wait).getText()
                        ).to.be.equals(rightSeed);
                        await this.driver.findElement(By.css('button#continue')).click();
                    });

                    it('Backup phrase cannot be selected with cursor');
                    it('Ability to copy backup phrase to clipboard');
                });

                describe('Confirm backup page', () => {
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
                    it('Additional account successufuly created while filling in the phrase in the correct order', async function () {
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

            // it('When you already have 1 account', async function () {
            //     await this.driver
            //         .wait(until.elementLocated(By.xpath("//div[contains(@class, '-assets-addAccount')]")), this.wait)
            //         .click();
            //
            //     // create new account page
            //     await this.driver.wait(
            //         until.elementLocated(By.xpath("//div[contains(@class, '-import-import')]")),
            //         this.wait
            //     );
            //
            //     await createAccount.call(this, accounts.second);
            //
            //     // await this.driver.sleep(3000);
            //     expect(
            //         await this.driver
            //             .wait(
            //                 until.elementIsVisible(
            //                     this.driver.wait(
            //                         until.elementLocated(
            //                             By.xpath(
            //                                 "//div[contains(@class, '-assets-assets')]" +
            //                                     "//div[contains(@class, 'wallets-list')]" +
            //                                     "//div[contains(@class, '-wallet-accountName')]"
            //                             )
            //                         ),
            //                         this.wait
            //                     )
            //                 ),
            //                 this.wait
            //             )
            //             .getText()
            //     ).to.be.equals(accounts.second);
            // });
            it('When you already have 2 accounts');
            it('When you already have 10 accounts');
        });

        // it('Account cannot be given a name that is already in use');
        // it('Ability to paste account name from clipboard');
        // it('In the account name, you can enter numbers, special characters and symbols from any layout');
        // it('Each time you open the "Create new account" screen, new addresses are generated');
        // it('You can select an account from the list of 5 generated (click on each account)');
        // it('Ability to copy backup phrase to clipboard');
        // it('Backup phrase cannot be selected with cursor');
        // it('After the Keeper is closed, the same screen with the same phrase opens on the phrase backup screen');

        // describe('Backup check', () => {
        //     it(
        //         'When filling in a seed in the wrong word order - there is no Confirm button. An error message and a "Clear" button are displayed'
        //     );
        //     it('The "Clear" button resets a partially filled phrase');
        //     it('The "Clear" button resets a completely filled phrase');
        //     it('The word can be reset by clicking (any, not only the last)');
        //     it('When filling in the correct order, the "Confirm" button appears');
        //     it('Clicking on "Confirm" opens the main screen. Account added to the end of the list');
        // });
    });

    describe('Import account', () => {
        it('Importing the first account from the "Create new account" screen (when no accounts have been added yet)');
        describe('Importing an additional account via the "Add account" button', () => {
            it('When you already have 1 account');
            it('When you already have 2 accounts');
            it('When you already have 10 accounts');
        });
        it('Minimum seed length - 25 characters');
        it('Any change in the seed (input / deletion / insertion of characters) changes the address');
        it('You can paste a seed from the clipboard');
        it('The account cannot be given a name already in use');
        it("Can't import seed for an already added account");
        it('The "Import account" button appears only with a valid entered seed');
        it('Clicking "Import account" opens the main screen. Account added to the end of the list');
    });
});
