import { By, Key, until, WebElement } from 'selenium-webdriver';
import { expect } from 'chai';
import { clear } from './utils';
import { App, Settings, Network, CreateNewAccount } from './utils/actions';
import { DEFAULT_ANIMATION_DELAY, DEFAULT_PASSWORD } from './utils/constants';
import { seedUtils } from '@waves/waves-transactions';

describe('Account creation', function () {
  this.timeout(60 * 1000);

  async function deleteAllAccounts() {
    while (true) {
      let form: WebElement = await this.driver.wait(
        until.elementLocated(
          By.xpath(
            "//div[(contains(@class, '-assets-assets') or contains(@class, '-import-import'))]"
          )
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
          until.elementLocated(
            By.xpath("//div[contains(@class, '-accountInfo-deleteButton')]")
          ),
          this.wait
        )
        .click();

      await this.driver
        .wait(until.elementLocated(By.css('button#deleteAccount')), this.wait)
        .click();
    }
  }

  before(async function () {
    await App.initVault.call(this);
    await Settings.setMaxSessionTimeout.call(this);

    await App.open.call(this);
    await this.driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@class, '-import-import')]")
      ),
      this.wait
    );
  });

  after(App.resetVault);

  describe('Create account', function () {
    const ACCOUNTS = {
      FIRST: 'first',
      SECOND: 'second',
      ANY: 'account123!@#_аккаунт',
    };
    const PILL_ANIMATION_DELAY = 200;

    after(deleteAllAccounts);

    it('Creating the first account via the "Create a new account" button', async function () {
      await this.driver.findElement(By.css('button#createNewAccount')).click();

      await this.driver
        .wait(until.elementLocated(By.css('button#continue')), this.wait)
        .click();

      await this.driver
        .wait(until.elementLocated(By.css('input#newAccountName')), this.wait)
        .sendKeys(ACCOUNTS.FIRST);
      await this.driver
        .wait(
          until.elementIsEnabled(
            this.driver.findElement(By.css('button#createBackup'))
          ),
          this.wait
        )
        .click();

      const seed: string[] = (
        await this.driver
          .wait(until.elementLocated(By.css('div.cant-select')), this.wait)
          .getText()
      ).split(' ');
      await this.driver.findElement(By.css('button#continue')).click();

      const writePills: WebElement = this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-confirmBackup-writeSeed')]")
        ),
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
      await this.driver
        .wait(until.elementLocated(By.css('button#confirmBackup')), this.wait)
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
      ).to.be.equals(ACCOUNTS.FIRST);
    });

    describe('Creating an additional account via the "Add account" button', function () {
      describe('When you already have 1 account', function () {
        describe('Create new account page', function () {
          before(async function () {
            await this.driver
              .wait(
                until.elementLocated(
                  By.xpath("//div[contains(@class, '-assets-addAccount')]")
                ),
                this.wait
              )
              .click();

            await this.driver
              .wait(
                until.elementLocated(By.css('button#createNewAccount')),
                this.wait
              )
              .click();
          });

          it('Each time you open the "Create new account" screen, new addresses are generated', async function () {
            const prevAddress = await this.driver
              .wait(
                until.elementLocated(
                  By.xpath("//div[contains(@class, '-newwallet-greyLine')]")
                )
              )
              .getText();
            await this.driver
              .findElement(By.css('div.arrow-back-icon'))
              .click();

            await this.driver
              .wait(
                until.elementLocated(By.css('button#createNewAccount')),
                this.wait
              )
              .click();

            expect(
              await this.driver
                .wait(
                  until.elementLocated(
                    By.xpath("//div[contains(@class, '-newwallet-greyLine')]")
                  )
                )
                .getText()
            ).to.be.not.equal(prevAddress);
          });

          it('You can select any account from the list of 5 generated', async function () {
            const addressEl: WebElement = this.driver.wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, '-newwallet-greyLine')]")
              )
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

            await this.driver
              .wait(until.elementLocated(By.css('button#continue')), this.wait)
              .click();
          });
        });

        describe('Account name page', function () {
          let accountNameInput: WebElement,
            createBackupBtn: WebElement,
            errorDiv: WebElement;
          before(function () {
            accountNameInput = this.driver.wait(
              until.elementLocated(By.css('input#newAccountName')),
              this.wait
            );
            createBackupBtn = this.driver.findElement(
              By.css('button#createBackup')
            );
            errorDiv = this.driver.findElement(
              By.xpath(
                "//input[@id='newAccountName']" +
                  "//following-sibling::div[contains(@class, '-error-error')]"
              )
            );
          });

          beforeEach(async function () {
            await clear(accountNameInput);
          });

          it('Account cannot be given a name that is already in use', async function () {
            await accountNameInput.sendKeys(ACCOUNTS.FIRST);
            await accountNameInput.sendKeys('\t');
            expect(await errorDiv.getText()).matches(/name already exist/i);
            expect(await createBackupBtn.isEnabled()).to.be.false;
          });

          it('Ability to paste account name from clipboard');
          it('In the account name, you can enter numbers, special characters and symbols from any layout', async function () {
            await accountNameInput.sendKeys(ACCOUNTS.ANY);
            await accountNameInput.sendKeys('\t');
            expect(await errorDiv.getText()).to.be.empty;
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
            await App.open.call(this);
            expect(
              await this.driver
                .wait(
                  until.elementLocated(By.css('div.cant-select')),
                  this.wait
                )
                .getText()
            ).to.be.equals(rightSeed);
            await this.driver.findElement(By.css('button#continue')).click();
          });

          it('Backup phrase cannot be selected with cursor');
          it('Ability to copy backup phrase to clipboard');
        });

        describe('Confirm backup page', function () {
          let clearButton: WebElement;
          const xpWriteSeed =
              "//div[contains(@class, '-confirmBackup-writeSeed')]",
            xpReadSeed = "//div[contains(@class, '-confirmBackup-readSeed')]",
            xpVisiblePill =
              "//div[(contains(@class, '-pills-pill-') and not(contains(@class, '-pills-hidden')))]",
            PILLS_COUNT = 15;

          it('Filling in a seed in the wrong word order', async function () {
            // there is no Confirm button. An error message and a "Clear" button are displayed
            const wrongSeed = rightSeed.split(' ').reverse();
            const seedPills: WebElement = await this.driver.wait(
              until.elementLocated(By.xpath(xpWriteSeed)),
              this.wait
            );
            for (const word of wrongSeed) {
              await seedPills
                .findElement(
                  By.xpath(
                    "//div[not(contains(@class, '-pills-hidden'))]" +
                      `//div[contains(@class,'-pills-text')][text()='${word}']`
                  )
                )
                .click();
              await this.driver.sleep(PILL_ANIMATION_DELAY);
            }
            const errorDiv: WebElement = this.driver.wait(
              until.elementLocated(
                By.xpath("//div[contains(@class,'-error-error')]")
              )
            );
            expect(await errorDiv.isDisplayed()).to.be.true;
            expect(await errorDiv.getText()).is.not.empty;
            clearButton = this.driver.findElement(
              By.xpath("//div[contains(@class, '-confirmBackup-clearSeed')]")
            );
            expect(
              await this.driver
                .findElement(
                  By.xpath(
                    "//div[contains(@class, '-confirmBackup-clearSeed')]"
                  )
                )
                .isDisplayed()
            ).to.be.true;
            expect(
              await this.driver.findElements(
                By.xpath(xpReadSeed + xpVisiblePill)
              )
            ).length(PILLS_COUNT);
            expect(
              await this.driver.findElements(
                By.xpath(xpWriteSeed + xpVisiblePill)
              )
            ).to.be.empty;
          });

          it('The "Clear" button resets a completely filled phrase', async function () {
            await clearButton.click();
            await this.driver.sleep(PILL_ANIMATION_DELAY);

            expect(
              await this.driver.findElements(
                By.xpath("//div[contains(@class,'-error-error')]")
              )
            ).to.be.empty;

            expect(
              await this.driver.findElements(
                By.xpath("//div[contains(@class, '-confirmBackup-clearSeed')]")
              )
            ).to.be.empty;
            expect(
              await this.driver.findElements(
                By.xpath(xpReadSeed + xpVisiblePill)
              )
            ).to.be.empty;
            expect(
              await this.driver.findElements(
                By.xpath(xpWriteSeed + xpVisiblePill)
              )
            ).length(PILLS_COUNT);
          });

          it('The "Clear" button resets a partially filled phrase', function () {
            this.skip();
            // FIXME ui doesnt show the "Clear" button if the phrase is partially filled
          });

          it('The word can be reset by clicking (any, not only the last)', async function () {
            const writePills: WebElement[] = await this.driver.wait(
              until.elementsLocated(By.xpath(xpWriteSeed + xpVisiblePill)),
              this.wait
            );
            for (const writePill of writePills) {
              await writePill.click();
              await this.driver.sleep(PILL_ANIMATION_DELAY);
            }
            await this.driver.wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, '-confirmBackup-clearSeed')]")
              ),
              this.wait
            );
            expect(
              await this.driver.findElements(
                By.xpath(xpReadSeed + xpVisiblePill)
              )
            ).length(PILLS_COUNT);
            expect(
              await this.driver.findElements(
                By.xpath(xpWriteSeed + xpVisiblePill)
              )
            ).to.be.empty;

            const readPills: WebElement[] = await this.driver.findElements(
              By.xpath(
                "//div[contains(@class, '-confirmBackup-readSeed')]" +
                  "//div[(contains(@class, '-pills-pill-') and not(contains(@class, '-pills-hidden')))]"
              )
            );
            for (const readPill of readPills) {
              await readPill.click();
              await this.driver.sleep(PILL_ANIMATION_DELAY);
            }

            expect(
              await this.driver.findElements(
                By.xpath(xpReadSeed + xpVisiblePill)
              )
            ).to.be.empty;
            expect(
              await this.driver.findElements(
                By.xpath(xpWriteSeed + xpVisiblePill)
              )
            ).length(PILLS_COUNT);
          });

          it('Additional account successfully created while filling in the phrase in the correct order', async function () {
            const writePills: WebElement = this.driver.wait(
              until.elementLocated(By.xpath(xpWriteSeed)),
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
            await this.driver
              .wait(
                until.elementLocated(By.css('button#confirmBackup')),
                this.wait
              )
              .click();

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

  describe('Import account using seed phrase', function () {
    const ACCOUNTS = {
      FIRST: { SEED: 'this is first account seed', NAME: 'first' },
      MORE_25_CHARS: {
        SEED: 'there is more than 25 characters',
        NAME: 'more than 25 characters',
      },
      LESS_25_CHARS: { SEED: 'too short seed', NAME: 'short' },
    };

    after(deleteAllAccounts);

    it('Importing the first account via the "Import account" button', async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="importSeed"]')),
          this.wait
        )
        .click();

      await this.driver
        .wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, '-importSeed-content')]//textarea")
          ),
          this.wait
        )
        .sendKeys(ACCOUNTS.FIRST.SEED);
      await this.driver
        .wait(
          until.elementIsEnabled(
            this.driver.findElement(By.css('button#importAccount'))
          ),
          this.wait
        )
        .click();

      await this.driver
        .wait(until.elementLocated(By.css('input#newAccountName')), this.wait)
        .sendKeys(ACCOUNTS.FIRST.NAME);
      await this.driver
        .wait(
          until.elementIsEnabled(
            this.driver.findElement(By.css('button#continue'))
          ),
          this.wait
        )
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
              until.elementLocated(
                By.xpath("//div[contains(@class, '-assets-addAccount')]")
              ),
              this.wait
            )
            .click();

          await this.driver
            .wait(
              until.elementLocated(By.css('[data-testid="importSeed"]')),
              this.wait
            )
            .click();
        });
        describe('Welcome back page', function () {
          let seedTextarea: WebElement,
            importAccountBtn: WebElement,
            currentAddressDiv: WebElement;

          before(function () {
            seedTextarea = this.driver.wait(
              until.elementLocated(
                By.xpath(
                  "//div[contains(@class, '-importSeed-content')]//textarea"
                )
              ),
              this.wait
            );
            importAccountBtn = this.driver.findElement(
              By.css('button#importAccount')
            );
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
            expect(await currentAddressDiv.getText()).to.be.not.equal(
              lastAddress
            );
          });

          it('You can paste a seed from the clipboard');

          it('Correct seed entered', async function () {
            await seedTextarea.sendKeys(ACCOUNTS.MORE_25_CHARS.SEED);
            expect(await importAccountBtn.isEnabled()).to.be.true;
            await importAccountBtn.click();
          });
        });

        describe('Account name page', function () {
          let accountNameInput: WebElement,
            continueBtn: WebElement,
            errorDiv: WebElement;

          before(function () {
            accountNameInput = this.driver.wait(
              until.elementLocated(By.css('input#newAccountName')),
              this.wait
            );
            continueBtn = this.driver.findElement(By.css('button#continue'));
            errorDiv = this.driver.findElement(
              By.xpath(
                "//input[@id='newAccountName']" +
                  "//following-sibling::div[contains(@class, '-error-error')]"
              )
            );
          });

          beforeEach(async function () {
            await clear(accountNameInput);
          });

          it('The account cannot be given a name already in use', async function () {
            await accountNameInput.sendKeys(ACCOUNTS.FIRST.NAME);
            await accountNameInput.sendKeys('\t');
            expect(await errorDiv.getText()).matches(/name already exist/i);
            expect(await continueBtn.isEnabled()).to.be.false;
          });

          it('Additional account successfully imported while entered correct account name', async function () {
            await accountNameInput.sendKeys(ACCOUNTS.MORE_25_CHARS.NAME);
            await accountNameInput.sendKeys('\t');
            expect(errorDiv.getText()).to.be.empty;
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

  describe('Import accounts using keystore file', function () {
    describe('validation', () => {
      it(
        'keeps "Continue" button disabled until both keystore file is selected and password is entered'
      );
    });

    describe('file parsing and decryption', () => {
      beforeEach(async function () {
        await this.driver
          .findElement(By.css('[data-testid="importKeystore"]'))
          .click();
      });

      afterEach(async function () {
        await this.driver
          .findElement(
            By.xpath("//div[contains(@class, '-menu-arrowBackIcon')]")
          )
          .click();
      });

      function extractParsedAccountsFromDOM() {
        return this.driver
          .findElements(By.css('[data-testid="accountsGroup"]'), this.wait)
          .then(accountGroups =>
            Promise.all(
              accountGroups.map(group =>
                Promise.all([
                  group
                    .findElement(
                      By.css('[data-testid="accountsGroupLabel"]'),
                      this.wait
                    )
                    .getText(),
                  group
                    .findElements(
                      By.css('[data-testid="accountCard"]'),
                      this.wait
                    )
                    .then(accountCards =>
                      Promise.all(
                        accountCards.map(card =>
                          Promise.all([
                            card
                              .findElement(
                                By.css('[data-testid="accountName"]')
                              )
                              .getText(),
                            card.getAttribute('title'),
                          ]).then(([name, address]) => ({
                            name,
                            address,
                          }))
                        )
                      )
                    ),
                ]).then(([label, accounts]) => ({
                  label,
                  accounts,
                }))
              )
            )
          );
      }

      it('can decrypt the correct keeper keystore file', async function () {
        await this.driver
          .findElement(By.css('[data-testid="fileInput"]'))
          .sendKeys('/fixtures/keystore-keeper.json');

        await this.driver
          .findElement(By.css('[data-testid="passwordInput"]'))
          .sendKeys('xHZ7Zaxu2wuncWC');
        await this.driver
          .findElement(By.css('[data-testid="submitButton"]'))
          .click();

        expect(await extractParsedAccountsFromDOM.call(this)).to.deep.equal([
          {
            label: 'Mainnet',
            accounts: [
              { name: 'test2', address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r' },
            ],
          },
          {
            label: 'Testnet',
            accounts: [
              { name: 'test', address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h' },
              { name: 'test3', address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi' },
            ],
          },
          {
            label: 'Stagenet',
            accounts: [
              { name: 'test4', address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D' },
            ],
          },
        ]);
      });

      it('can decrypt the correct exchange keystore file', async function () {
        await this.driver
          .findElement(By.css('[data-testid="fileInput"]'))
          .sendKeys('/fixtures/keystore-exchange.json');

        await this.driver
          .findElement(By.css('[data-testid="passwordInput"]'))
          .sendKeys('N72r78ByXBfNBnN#');
        await this.driver
          .findElement(By.css('[data-testid="submitButton"]'))
          .click();

        expect(await extractParsedAccountsFromDOM.call(this)).to.deep.equal([
          {
            label: 'Mainnet',
            accounts: [
              { name: 'test', address: '3PAqjy2wRWdrEBCmj66UbNUjo5KDksk9rTA' },
              { name: 'test2', address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r' },
            ],
          },
        ]);
      });

      it('shows an error if the file format is not recognized');
      it('shows an error if the password is wrong');
    });

    describe('actual import', function () {
      function extractAccountCheckboxesFromDOM() {
        return this.driver
          .findElements(By.css('[data-testid="accountCard"]'))
          .then(cards =>
            Promise.all(
              cards.map(card =>
                Promise.all([
                  card.getAttribute('title'),
                  card
                    .findElement(By.css('[data-testid="accountName"]'))
                    .then(accountName => accountName.getText()),
                  card.findElement(By.name('selected')).then(
                    checkbox =>
                      checkbox
                        .getAttribute('checked')
                        .then(checked => checked === 'true'),
                    () => null
                  ),
                ]).then(([address, name, selected]) => ({
                  address,
                  name,
                  selected,
                }))
              )
            )
          );
      }

      describe('when no accounts exist', function () {
        it.skip('allows to select and import all accounts', async function () {
          await this.driver
            .findElement(By.css('[data-testid="importKeystore"]'))
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/fixtures/keystore-keeper.json');

          await this.driver
            .findElement(By.css('[data-testid="passwordInput"]'))
            .sendKeys('xHZ7Zaxu2wuncWC');
          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          expect(
            await extractAccountCheckboxesFromDOM.call(this)
          ).to.have.deep.ordered.members([
            {
              name: 'test2',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: true,
            },
            {
              name: 'test',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              selected: true,
            },
            {
              name: 'test3',
              address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi',
              selected: true,
            },
            {
              name: 'test4',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              selected: true,
            },
          ]);

          await this.driver
            .findElement(
              By.css(
                'input[type="checkbox"][value="3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi"]'
              )
            )
            .click();

          await this.driver
            .findElement(
              By.css(
                'input[type="checkbox"][value="3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r"]'
              )
            )
            .click();

          expect(
            await extractAccountCheckboxesFromDOM.call(this)
          ).to.have.deep.ordered.members([
            {
              name: 'test2',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: false,
            },
            {
              name: 'test',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              selected: true,
            },
            {
              name: 'test3',
              address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi',
              selected: false,
            },
            {
              name: 'test4',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              selected: true,
            },
          ]);

          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test']);

          await Network.switchTo.call(this, 'Stagenet');

          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test4']);

          await new Promise(resolve => setTimeout(resolve, 1500)); // waiting for save after debounce

          const vault = await this.driver.executeAsyncScript(function () {
            const cb = arguments[arguments.length - 1];
            // @ts-ignore
            chrome.storage.local.get('WalletController', storage =>
              cb(storage.WalletController.vault)
            );
          });

          expect(
            JSON.parse(seedUtils.decryptSeed(vault, DEFAULT_PASSWORD))
          ).to.deep.equal([
            {
              seed: 'once green grace barrel tray ethics stock wedding visit puzzle multiply pulp donor organ cluster',
              publicKey: '7cdJyEuasmgDvWUcPSfq6JG9yJYLEHy1XQ1xeUoPJefz',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              networkCode: 'S',
              network: 'stagenet',
              type: 'seed',
              name: 'test4',
            },
            {
              seed: 'side angry perfect sight capital absurd stuff pulp climb jealous onion address speed portion category',
              publicKey: '3Z1t3d8pyJU3R9ZqonaJsBT9XuDVbf5xoECFgudtKGTw',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              networkCode: 'T',
              network: 'testnet',
              type: 'seed',
              name: 'test',
            },
          ]);
        });
      });

      describe('when some, but not all accounts already exist', function () {
        it.skip('allows to select only unexisting accounts', async function () {
          await this.driver
            .wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, '-assets-addAccount')]")
              ),
              this.wait
            )
            .click();
          await this.driver
            .findElement(By.css('[data-testid="importKeystore"]'))
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/fixtures/keystore-keeper.json');

          await this.driver
            .findElement(By.css('[data-testid="passwordInput"]'))
            .sendKeys('xHZ7Zaxu2wuncWC');
          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          expect(
            await extractAccountCheckboxesFromDOM.call(this)
          ).to.have.deep.ordered.members([
            {
              name: 'test2',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: true,
            },
            {
              name: 'test',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              selected: null,
            },
            {
              name: 'test3',
              address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi',
              selected: true,
            },
            {
              name: 'test4',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              selected: null,
            },
          ]);

          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          await Network.switchTo.call(this, 'Testnet');
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test', 'test3']);

          await Network.switchTo.call(this, 'Stagenet');
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test4']);

          await Network.switchTo.call(this, 'Mainnet');
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test2']);

          await new Promise(resolve => setTimeout(resolve, 1500)); // waiting for save after debounce

          const vault = await this.driver.executeAsyncScript(function () {
            const cb = arguments[arguments.length - 1];
            // @ts-ignore
            chrome.storage.local.get('WalletController', storage =>
              cb(storage.WalletController.vault)
            );
          });

          expect(
            JSON.parse(seedUtils.decryptSeed(vault, DEFAULT_PASSWORD))
          ).to.deep.equal([
            {
              seed: 'once green grace barrel tray ethics stock wedding visit puzzle multiply pulp donor organ cluster',
              publicKey: '7cdJyEuasmgDvWUcPSfq6JG9yJYLEHy1XQ1xeUoPJefz',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              networkCode: 'S',
              network: 'stagenet',
              type: 'seed',
              name: 'test4',
            },
            {
              seed: 'side angry perfect sight capital absurd stuff pulp climb jealous onion address speed portion category',
              publicKey: '3Z1t3d8pyJU3R9ZqonaJsBT9XuDVbf5xoECFgudtKGTw',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              networkCode: 'T',
              network: 'testnet',
              type: 'seed',
              name: 'test',
            },
            {
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              name: 'test2',
              network: 'mainnet',
              networkCode: 'W',
              publicKey: '57tdgQxNNfehn9BQQm834NMiesYzXFEhnPaw1z5yNzHD',
              seed: 'odor refuse imitate busy purity where capital rebuild follow foil sorry tornado dress boring envelope',
              type: 'seed',
            },
            {
              address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi',
              name: 'test3',
              network: 'testnet',
              networkCode: 'T',
              publicKey: '3ufbp8wCLhWqbXtbakBR95FgqSdm66UYaNieuoEKyztS',
              seed: 'defy credit shoe expect pair gun future slender escape visa test book tone patient vibrant',
              type: 'seed',
            },
          ]);
        });
      });

      describe('when all accounts exist', function () {
        it.skip('does not allow selecting anything and shows the "Skip" button', async function () {
          await this.driver
            .wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, '-assets-addAccount')]")
              ),
              this.wait
            )
            .click();
          await this.driver
            .findElement(By.css('[data-testid="importKeystore"]'))
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/fixtures/keystore-keeper.json');

          await this.driver
            .findElement(By.css('[data-testid="passwordInput"]'))
            .sendKeys('xHZ7Zaxu2wuncWC');
          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          expect(
            await extractAccountCheckboxesFromDOM.call(this)
          ).to.have.deep.ordered.members([
            {
              name: 'test2',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: null,
            },
            {
              name: 'test',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              selected: null,
            },
            {
              name: 'test3',
              address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi',
              selected: null,
            },
            {
              name: 'test4',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              selected: null,
            },
          ]);

          await this.driver
            .findElement(By.css('[data-testid="skipButton"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );
        });
      });

      describe('when the user already has an account with the same name, but different address', function () {
        it('adds suffix to the name', async function () {
          await App.resetVault.call(this);
          await App.initVault.call(this);
          await Network.switchTo.call(this, 'Testnet');
          await CreateNewAccount.importAccount.call(
            this,
            'test',
            'this is the seed for the test account'
          );

          await this.driver
            .wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, '-assets-addAccount')]")
              ),
              this.wait
            )
            .click();
          await this.driver
            .findElement(By.css('[data-testid="importKeystore"]'))
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/fixtures/keystore-keeper.json');

          await this.driver
            .findElement(By.css('[data-testid="passwordInput"]'))
            .sendKeys('xHZ7Zaxu2wuncWC');
          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          expect(
            await extractAccountCheckboxesFromDOM.call(this)
          ).to.have.deep.ordered.members([
            {
              name: 'test2',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: true,
            },
            {
              name: 'test (1)',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              selected: true,
            },
            {
              name: 'test3',
              address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi',
              selected: true,
            },
            {
              name: 'test4',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              selected: true,
            },
          ]);

          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(
              By.xpath(
                "//div[contains(@class, '-assets-assets')]" +
                  "//div[contains(@class, '-wallet-inner')]" +
                  "//div[contains(@class, '-wallet-accountName')][text()='test3']"
              )
            ),
            this.wait
          );

          await new Promise(resolve =>
            setTimeout(resolve, DEFAULT_ANIMATION_DELAY)
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test', 'test (1)', 'test3']);

          await Network.switchTo.call(this, 'Stagenet');
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test4']);

          await Network.switchTo.call(this, 'Mainnet');
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test2']);

          await new Promise(resolve => setTimeout(resolve, 1500)); // waiting for save after debounce

          const vault = await this.driver.executeAsyncScript(function () {
            const cb = arguments[arguments.length - 1];
            // @ts-ignore
            chrome.storage.local.get('WalletController', storage =>
              cb(storage.WalletController.vault)
            );
          });

          expect(
            JSON.parse(seedUtils.decryptSeed(vault, DEFAULT_PASSWORD))
          ).to.deep.equal([
            {
              address: '3NCcwK7MUc4ZwtiBbJBnrqqw6dxwdj8aQrc',
              name: 'test',
              network: 'testnet',
              networkCode: 'T',
              publicKey: '6qqBjSPoBEUtayn3TPgC1twGii7ivhAB7LGwfy2ntjyE',
              seed: 'this is the seed for the test account',
              type: 'seed',
            },
            {
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              name: 'test2',
              network: 'mainnet',
              networkCode: 'W',
              publicKey: '57tdgQxNNfehn9BQQm834NMiesYzXFEhnPaw1z5yNzHD',
              seed: 'odor refuse imitate busy purity where capital rebuild follow foil sorry tornado dress boring envelope',
              type: 'seed',
            },
            {
              seed: 'once green grace barrel tray ethics stock wedding visit puzzle multiply pulp donor organ cluster',
              publicKey: '7cdJyEuasmgDvWUcPSfq6JG9yJYLEHy1XQ1xeUoPJefz',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              networkCode: 'S',
              network: 'stagenet',
              type: 'seed',
              name: 'test4',
            },
            {
              seed: 'side angry perfect sight capital absurd stuff pulp climb jealous onion address speed portion category',
              publicKey: '3Z1t3d8pyJU3R9ZqonaJsBT9XuDVbf5xoECFgudtKGTw',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              networkCode: 'T',
              network: 'testnet',
              type: 'seed',
              name: 'test (1)',
            },
            {
              address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi',
              name: 'test3',
              network: 'testnet',
              networkCode: 'T',
              publicKey: '3ufbp8wCLhWqbXtbakBR95FgqSdm66UYaNieuoEKyztS',
              seed: 'defy credit shoe expect pair gun future slender escape visa test book tone patient vibrant',
              type: 'seed',
            },
          ]);
        });

        it('increments the number in suffix if it already exists', async function () {
          await App.resetVault.call(this);
          await App.initVault.call(this);
          await Network.switchTo.call(this, 'Testnet');
          await CreateNewAccount.importAccount.call(
            this,
            'test',
            'this is a seed for the test account'
          );
          await this.driver
            .wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, '-assets-addAccount')]")
              ),
              this.wait
            )
            .click();
          await CreateNewAccount.importAccount.call(
            this,
            'test (1)',
            'this is an another seed for the test account'
          );

          await this.driver
            .wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, '-assets-addAccount')]")
              ),
              this.wait
            )
            .click();
          await this.driver
            .findElement(By.css('[data-testid="importKeystore"]'))
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/fixtures/keystore-keeper.json');

          await this.driver
            .findElement(By.css('[data-testid="passwordInput"]'))
            .sendKeys('xHZ7Zaxu2wuncWC');
          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          expect(
            await extractAccountCheckboxesFromDOM.call(this)
          ).to.have.deep.ordered.members([
            {
              name: 'test2',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: true,
            },
            {
              name: 'test (2)',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              selected: true,
            },
            {
              name: 'test3',
              address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi',
              selected: true,
            },
            {
              name: 'test4',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              selected: true,
            },
          ]);

          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(
              By.xpath(
                "//div[contains(@class, '-assets-assets')]" +
                  "//div[contains(@class, '-wallet-inner')]" +
                  "//div[contains(@class, '-wallet-accountName')][text()='test3']"
              )
            ),
            this.wait
          );

          await new Promise(resolve =>
            setTimeout(resolve, DEFAULT_ANIMATION_DELAY)
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test', 'test (1)', 'test (2)', 'test3']);

          await Network.switchTo.call(this, 'Stagenet');
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test4']);

          await Network.switchTo.call(this, 'Mainnet');
          await this.driver.wait(
            until.elementLocated(
              By.xpath("//div[contains(@class, '-assets-assets')]")
            ),
            this.wait
          );

          expect(
            await this.driver
              .findElements(
                By.xpath(
                  "//div[contains(@class, '-assets-assets')]" +
                    "//div[contains(@class, '-wallet-inner')]" +
                    "//div[contains(@class, '-wallet-accountName')]"
                )
              )
              .then(accountNames =>
                Promise.all(accountNames.map(accName => accName.getText()))
              )
          ).to.have.ordered.members(['test2']);

          await new Promise(resolve => setTimeout(resolve, 1500)); // waiting for save after debounce

          const vault = await this.driver.executeAsyncScript(function () {
            const cb = arguments[arguments.length - 1];
            // @ts-ignore
            chrome.storage.local.get('WalletController', storage =>
              cb(storage.WalletController.vault)
            );
          });

          expect(
            JSON.parse(seedUtils.decryptSeed(vault, DEFAULT_PASSWORD))
          ).to.deep.equal([
            {
              address: '3MyZvqgx6E9b1GTvuL5dgMQmeXvxANYGmWE',
              name: 'test',
              network: 'testnet',
              networkCode: 'T',
              publicKey: '9qnE2ZZjnsmmYPKCeiRj1wQVneGWSYXDhyDDQwmkLMht',
              seed: 'this is a seed for the test account',
              type: 'seed',
            },
            {
              address: '3MvL177rYof5hps3GhrWSmBGgAwF3paZ19o',
              name: 'test (1)',
              network: 'testnet',
              networkCode: 'T',
              publicKey: 'B2e7hxGiiZnQFY6iwF6jn9gABYZ44bFBMHKXtiXJPTVk',
              seed: 'this is an another seed for the test account',
              type: 'seed',
            },
            {
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              name: 'test2',
              network: 'mainnet',
              networkCode: 'W',
              publicKey: '57tdgQxNNfehn9BQQm834NMiesYzXFEhnPaw1z5yNzHD',
              seed: 'odor refuse imitate busy purity where capital rebuild follow foil sorry tornado dress boring envelope',
              type: 'seed',
            },
            {
              seed: 'once green grace barrel tray ethics stock wedding visit puzzle multiply pulp donor organ cluster',
              publicKey: '7cdJyEuasmgDvWUcPSfq6JG9yJYLEHy1XQ1xeUoPJefz',
              address: '3MWxaD2xCMBUHnKkLJUqH3xFca2ak8wdd6D',
              networkCode: 'S',
              network: 'stagenet',
              type: 'seed',
              name: 'test4',
            },
            {
              seed: 'side angry perfect sight capital absurd stuff pulp climb jealous onion address speed portion category',
              publicKey: '3Z1t3d8pyJU3R9ZqonaJsBT9XuDVbf5xoECFgudtKGTw',
              address: '3Mxpw1i3ZP6TbiuMU1qUdv6vSBoSvkCfQ8h',
              networkCode: 'T',
              network: 'testnet',
              type: 'seed',
              name: 'test (2)',
            },
            {
              address: '3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi',
              name: 'test3',
              network: 'testnet',
              networkCode: 'T',
              publicKey: '3ufbp8wCLhWqbXtbakBR95FgqSdm66UYaNieuoEKyztS',
              seed: 'defy credit shoe expect pair gun future slender escape visa test book tone patient vibrant',
              type: 'seed',
            },
          ]);
        });
      });
    });
  });
});
