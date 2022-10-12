import { expect } from 'chai';
import * as mocha from 'mocha';
import { By, Key, until, WebElement } from 'selenium-webdriver';

import { clear } from './utils';
import {
  AccountsHome,
  App,
  Network,
  PopupHome,
  Settings,
  Windows,
} from './utils/actions';

describe('Account creation', function () {
  async function deleteEachAndSwitchToAccounts(this: mocha.Context) {
    const repeat = true;

    while (repeat) {
      await this.driver.wait(
        until.elementLocated(
          By.css('[data-testid="assetsForm"], [data-testid="importForm"]')
        ),
        this.wait
      );

      const activeAccountCards = await this.driver.findElements(
        By.css('[data-testid="activeAccountCard"]')
      );

      if (!activeAccountCards.length) {
        break; // the cycle
      }

      await activeAccountCards[0].click();

      await this.driver
        .wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, 'deleteButton@accountInfo')]")
          ),
          this.wait
        )
        .click();

      await this.driver
        .wait(until.elementLocated(By.id('deleteAccount')), this.wait)
        .click();
    }

    expect(await this.driver.findElements(By.css('[data-testid="importForm"]')))
      .not.to.be.empty;

    await this.driver.switchTo().window(tabAccounts);
  }

  let tabKeeper: string, tabAccounts: string;

  before(async function () {
    await App.initVault();
    await Settings.setMaxSessionTimeout();
    await browser.openKeeperPopup();
    tabKeeper = await this.driver.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="addAccountBtn"]')),
        this.wait
      )
      .click();
    [tabAccounts] = await waitForNewWindows(1);

    await this.driver.switchTo().window(tabAccounts);
    await this.driver.navigate().refresh();
  });

  after(async function () {
    await App.closeBgTabs.call(this, tabKeeper);
    await App.resetVault();
  });

  describe('Create', function () {
    const ACCOUNTS = {
      FIRST: 'first',
      SECOND: 'second',
      ANY: 'account123!@#_аккаунт',
    };
    const PILL_ANIMATION_DELAY = 200;

    after(deleteEachAndSwitchToAccounts);

    it('first account via "Create a new account"', async function () {
      await this.driver
        .wait(
          until.elementIsVisible(
            this.driver.wait(
              until.elementLocated(
                By.css('[data-testid="createNewAccountBtn"]')
              ),
              this.wait
            )
          ),
          this.wait
        )
        .click();

      await this.driver
        .wait(until.elementLocated(By.css('button#continue')), this.wait)
        .click();

      const seed: string[] = (
        await this.driver
          .wait(until.elementLocated(By.css('div.cant-select')), this.wait)
          .getText()
      ).split(' ');
      await this.driver.findElement(By.css('button#continue')).click();

      for (const word of seed) {
        await this.driver
          .findElement(
            By.xpath(
              "//div[(contains(@class, 'selectedPill@pills') and not(contains(@class, 'hiddenPill@pills')))]" +
                `//div[contains(@class, 'text@pills')][text()='${word}']`
            )
          )
          .click();
        await this.driver.sleep(PILL_ANIMATION_DELAY);
      }
      await this.driver
        .wait(until.elementLocated(By.css('button#confirmBackup')), this.wait)
        .click();

      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid=newAccountNameInput]')),
          this.wait
        )
        .sendKeys(ACCOUNTS.FIRST);

      await this.driver
        .findElement(By.css('[data-testid=continueBtn]'))
        .click();

      await this.driver.wait(
        until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
        this.wait
      );

      await this.driver
        .findElement(By.css('[data-testid="addAnotherAccountBtn"]'))
        .click();

      await this.driver.switchTo().window(tabKeeper);

      expect(await PopupHome.getActiveAccountName()).to.equal(ACCOUNTS.FIRST);
    });

    describe('additional account via "Add account"', function () {
      describe('When you already have 1 account', function () {
        describe('Create new account page', function () {
          before(async function () {
            await PopupHome.addAccount();

            await this.driver.switchTo().window(tabAccounts);

            await this.driver
              .wait(
                until.elementIsVisible(
                  await this.driver.wait(
                    until.elementLocated(
                      By.css('[data-testid="createNewAccountBtn"]')
                    ),
                    this.wait
                  )
                ),
                this.wait
              )
              .click();
          });

          it('Each time you open the "Create new account" screen, new addresses are generated', async function () {
            const prevAddress = await this.driver
              .wait(
                until.elementLocated(
                  By.xpath("//div[contains(@class, 'greyLine@newwallet')]")
                )
              )
              .getText();
            await this.driver
              .findElement(By.css('div.arrow-back-icon'))
              .click();

            await this.driver
              .wait(
                until.elementLocated(
                  By.css('[data-testid="createNewAccountBtn"]')
                ),
                this.wait
              )
              .click();

            expect(
              await this.driver
                .wait(
                  until.elementLocated(
                    By.xpath("//div[contains(@class, 'greyLine@newwallet')]")
                  )
                )
                .getText()
            ).to.be.not.equal(prevAddress);
          });

          it('You can select any account from the list of 5 generated', async function () {
            const addressEl = this.driver.wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, 'greyLine@newwallet')]")
              )
            );
            let prevAddress: string | null = null;
            const avatarList = await this.driver.findElements(
              By.xpath("//div[contains(@class, 'avatar@avatar')]")
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

        let rightSeed: string;
        describe('Save backup phrase page', function () {
          it('Backup phrase is visible', async function () {
            const seedEl = this.driver.wait(
              until.elementLocated(By.css('div.cant-select')),
              this.wait
            );

            expect(await seedEl.isDisplayed()).to.be.true;
            rightSeed = await seedEl.getText();
            expect(rightSeed).to.be.not.empty;

            await this.driver.findElement(By.css('button#continue')).click();
          });

          it('Backup phrase cannot be selected with cursor');
          it('Ability to copy backup phrase to clipboard');
        });

        describe('Confirm backup page', function () {
          let clearButton: WebElement;
          const xpWriteVisiblePill =
              "//div[(contains(@class, 'selectedPill@pills') and not(contains(@class, 'hiddenPill@pills')))]",
            xpReadVisiblePill =
              "//div[(contains(@class, 'pill@pills') and not(contains(@class, 'selectedPill@pills')) and not(contains(@class, 'hiddenPill@pills')))]",
            PILLS_COUNT = 15;

          it('Filling in a seed in the wrong word order', async function () {
            // there is no Confirm button. An error message and a "Clear" button are displayed
            const wrongSeed = rightSeed.split(' ').reverse();
            for (const word of wrongSeed) {
              await this.driver
                .findElement(
                  By.xpath(
                    `${xpWriteVisiblePill}//div[contains(@class, 'text@pills')][text()='${word}']`
                  )
                )
                .click();
              await this.driver.sleep(PILL_ANIMATION_DELAY);
            }
            const errorDiv = this.driver.wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, 'error@error')]")
              ),
              this.wait
            );
            expect(await errorDiv.isDisplayed()).to.be.true;
            expect(await errorDiv.getText()).is.not.empty;
            clearButton = this.driver.findElement(
              By.xpath("//div[contains(@class, 'clearSeed@confirmBackup')]")
            );
            expect(
              await this.driver
                .findElement(
                  By.xpath("//div[contains(@class, 'clearSeed@confirmBackup')]")
                )
                .isDisplayed()
            ).to.be.true;
            expect(
              await this.driver.findElements(By.xpath(xpReadVisiblePill))
            ).length(PILLS_COUNT);
            expect(await this.driver.findElements(By.xpath(xpWriteVisiblePill)))
              .to.be.empty;
          });

          it('The "Clear" button resets a completely filled phrase', async function () {
            await clearButton.click();
            await this.driver.sleep(PILL_ANIMATION_DELAY);

            expect(
              await this.driver.findElements(
                By.xpath("//div[contains(@class, 'error@error')]")
              )
            ).to.be.empty;

            expect(
              await this.driver.findElements(
                By.xpath("//div[contains(@class, 'clearSeed@confirmBackup')]")
              )
            ).to.be.empty;
            expect(await this.driver.findElements(By.xpath(xpReadVisiblePill)))
              .to.be.empty;
            expect(
              await this.driver.findElements(By.xpath(xpWriteVisiblePill))
            ).length(PILLS_COUNT);
          });

          it('The word can be reset by clicking (any, not only the last)', async function () {
            const writePills = await this.driver.wait(
              until.elementsLocated(By.xpath(xpWriteVisiblePill)),
              this.wait
            );
            for (const writePill of writePills) {
              await writePill.click();
              await this.driver.sleep(PILL_ANIMATION_DELAY);
            }
            await this.driver.wait(
              until.elementLocated(
                By.xpath("//div[contains(@class, 'clearSeed@confirmBackup')]")
              ),
              this.wait
            );
            expect(
              await this.driver.findElements(By.xpath(xpReadVisiblePill))
            ).length(PILLS_COUNT);
            expect(await this.driver.findElements(By.xpath(xpWriteVisiblePill)))
              .to.be.empty;

            const readPills = await this.driver.findElements(
              By.xpath(
                "//div[contains(@class, 'readSeed@confirmBackup')]" +
                  "//div[(contains(@class, 'pill@pills') and not(contains(@class, 'hiddenPill@pills')))]"
              )
            );

            for (const readPill of readPills) {
              await readPill.click();
              await this.driver.sleep(PILL_ANIMATION_DELAY);
            }

            expect(await this.driver.findElements(By.xpath(xpReadVisiblePill)))
              .to.be.empty;
            expect(
              await this.driver.findElements(By.xpath(xpWriteVisiblePill))
            ).length(PILLS_COUNT);
          });

          it('Account name page opened while filling in the phrase in the correct order', async function () {
            for (const word of rightSeed.split(' ')) {
              await this.driver
                .findElement(
                  By.xpath(
                    `${xpWriteVisiblePill}//div[contains(@class, 'text@pills')][text()='${word}']`
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
          });
        });

        describe('Account name page', function () {
          let accountNameInput: WebElement,
            continueBtn: WebElement,
            errorDiv: WebElement;
          before(function () {
            accountNameInput = this.driver.wait(
              until.elementLocated(
                By.css('[data-testid="newAccountNameInput"]')
              ),
              this.wait
            );
            continueBtn = this.driver.findElement(
              By.css('[data-testid="continueBtn"]')
            );
            errorDiv = this.driver.findElement(
              By.css('[data-testid="newAccountNameError"]')
            );
          });

          beforeEach(async function () {
            await clear(accountNameInput);
          });

          it('Account cannot be given a name that is already in use', async function () {
            await accountNameInput.sendKeys(ACCOUNTS.FIRST);
            await accountNameInput.sendKeys('\t');
            expect(await errorDiv.getText()).matches(/name already exist/i);
            expect(await continueBtn.isEnabled()).to.be.false;
          });

          it('Ability to paste account name from clipboard');

          it('In the account name, you can enter numbers, special characters and symbols from any layout', async function () {
            await accountNameInput.sendKeys(ACCOUNTS.ANY);
            await accountNameInput.sendKeys('\t');
            expect(await errorDiv.getText()).to.be.empty;
            expect(await continueBtn.isEnabled()).to.be.true;
          });

          it('Account successfully created and selected', async function () {
            await accountNameInput.sendKeys(ACCOUNTS.ANY);
            await continueBtn.click();

            await this.driver.wait(
              until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
              this.wait
            );

            await this.driver
              .findElement(By.css('[data-testid="addAnotherAccountBtn"]'))
              .click();

            await this.driver.wait(
              until.elementLocated(By.css('[data-testid="importForm"]')),
              this.wait
            );

            await this.driver.switchTo().window(tabKeeper);
            await browser.openKeeperPopup();

            expect(await PopupHome.getActiveAccountName()).to.equal(
              ACCOUNTS.ANY
            );
          });
        });
      });

      it('When you already have 2 accounts');

      it('When you already have 10 accounts');
    });
  });

  describe('Import via seed', function () {
    const ACCOUNTS = {
      FIRST: { SEED: 'this is first account seed', NAME: 'first' },
      MORE_24_CHARS: {
        SEED: 'there is more than 24 characters',
        NAME: 'more than 24 characters',
      },
      LESS_24_CHARS: { SEED: 'too short seed', NAME: 'short' },
    };

    after(deleteEachAndSwitchToAccounts);

    it('first account via "Import account"', async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="importSeed"]')),
          this.wait
        )
        .click();

      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="seedInput"]')),
          this.wait
        )
        .sendKeys(ACCOUNTS.FIRST.SEED);
      await this.driver
        .wait(
          until.elementIsEnabled(
            this.driver.findElement(By.css('[data-testid="continueBtn"]'))
          ),
          this.wait
        )
        .click();

      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="newAccountNameInput"]')),
          this.wait
        )
        .sendKeys(ACCOUNTS.FIRST.NAME);
      await this.driver
        .wait(
          until.elementIsEnabled(
            this.driver.findElement(By.css('[data-testid="continueBtn"]'))
          ),
          this.wait
        )
        .click();

      await this.driver.wait(
        until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
        this.wait
      );

      await this.driver
        .findElement(By.css('[data-testid="addAnotherAccountBtn"]'))
        .click();

      await this.driver.wait(
        until.elementLocated(By.css('[data-testid="importForm"]')),
        this.wait
      );

      await this.driver.switchTo().window(tabKeeper);
      await browser.openKeeperPopup();

      expect(await PopupHome.getActiveAccountName()).to.be.equals(
        ACCOUNTS.FIRST.NAME
      );
    });

    describe('additional account via the "Add account"', function () {
      describe('When you already have 1 account', function () {
        before(async function () {
          await PopupHome.addAccount();

          await this.driver.switchTo().window(tabAccounts);
          await this.driver
            .wait(
              until.elementIsVisible(
                this.driver.wait(
                  until.elementLocated(By.css('[data-testid="importSeed"]')),
                  this.wait
                )
              ),
              this.wait
            )
            .click();
        });
        describe('Seed phrase page', function () {
          let seedTextarea: WebElement,
            importAccountBtn: WebElement,
            currentAddressDiv: WebElement;

          before(function () {
            seedTextarea = this.driver.wait(
              until.elementLocated(By.css('[data-testid="seedInput"]')),
              this.wait
            );
            importAccountBtn = this.driver.findElement(
              By.css('[data-testid="continueBtn"]')
            );
            currentAddressDiv = this.driver.findElement(
              By.css('[data-testid="address"]')
            );
          });

          beforeEach(async function () {
            await clear(seedTextarea);
          });

          it("Can't import seed with length less than 24 characters", async function () {
            await seedTextarea.sendKeys(ACCOUNTS.LESS_24_CHARS.SEED);
            await this.driver
              .findElement(By.css('[data-testid="continueBtn"]'))
              .click();

            const validationError = await this.driver.wait(
              until.elementLocated(By.css('[data-testid="validationError"]')),
              this.wait
            );
            expect(await validationError.getText()).to.equal(
              'Seed cannot be shorter than 24 characters'
            );
          });

          it('Can be switched to existed account', async function () {
            await seedTextarea.sendKeys(ACCOUNTS.FIRST.SEED);

            const validationError = await this.driver.wait(
              until.elementLocated(By.css('[data-testid="validationError"]')),
              this.wait
            );

            expect(
              await this.driver
                .findElement(By.css('[data-testid="continueBtn"]'))
                .getText()
            ).matches(/switch account/i);

            expect(await validationError.getText()).matches(
              /Account already known as .+/i
            );
          });

          it('Any change in the seed changes the address', async function () {
            let lastAddress: string | null = null,
              currentAddress: string;
            // input seed
            await seedTextarea.sendKeys(ACCOUNTS.MORE_24_CHARS.SEED);
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
            await seedTextarea.sendKeys(ACCOUNTS.MORE_24_CHARS.SEED);
            await importAccountBtn.click();

            await this.driver.wait(
              until.elementLocated(By.css('[data-testid="continueBtn"]')),
              this.wait
            );
          });
        });

        describe('Account name page', function () {
          let accountNameInput: WebElement,
            continueBtn: WebElement,
            errorDiv: WebElement;

          before(function () {
            accountNameInput = this.driver.wait(
              until.elementLocated(
                By.css('[data-testid="newAccountNameInput"]')
              ),
              this.wait
            );
            continueBtn = this.driver.findElement(
              By.css('[data-testid="continueBtn"]')
            );
            errorDiv = this.driver.findElement(
              By.css('[data-testid="newAccountNameError"]')
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
            await accountNameInput.sendKeys(ACCOUNTS.MORE_24_CHARS.NAME);
            await accountNameInput.sendKeys('\t');
            expect(errorDiv.getText()).to.be.empty;
            expect(await continueBtn.isEnabled()).to.be.true;
            await continueBtn.click();

            await this.driver.wait(
              until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
              this.wait
            );

            await this.driver
              .findElement(By.css('[data-testid="addAnotherAccountBtn"]'))
              .click();

            await this.driver.wait(
              until.elementLocated(By.css('[data-testid="importForm"]')),
              this.wait
            );

            await this.driver.switchTo().window(tabKeeper);
            await browser.openKeeperPopup();

            expect(await PopupHome.getActiveAccountName()).to.equal(
              ACCOUNTS.MORE_24_CHARS.NAME
            );
          });
        });
      });

      it('When you already have 2 accounts');

      it('When you already have 10 accounts');
    });
  });

  describe('Import via keystore file', function () {
    describe('validation', () => {
      it(
        'keeps "Continue" button disabled until both keystore file is selected and password is entered'
      );
    });

    describe('file parsing and decryption', () => {
      beforeEach(async function () {
        await this.driver
          .wait(until.elementLocated(By.css('[data-testid="importKeystore"]')))
          .click();
      });

      afterEach(async function () {
        await this.driver
          .findElement(
            By.xpath("//div[contains(@class, 'arrowBackIcon@menu')]")
          )
          .click();
      });

      function extractParsedAccountsFromDOM(this: mocha.Context) {
        return this.driver
          .findElements(By.css('[data-testid="accountsGroup"]'))
          .then(accountGroups =>
            Promise.all(
              accountGroups.map(group =>
                Promise.all([
                  group
                    .findElement(By.css('[data-testid="accountsGroupLabel"]'))
                    .getText(),
                  group
                    .findElements(By.css('[data-testid="accountCard"]'))
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
          .wait(
            until.elementLocated(By.css('[data-testid="fileInput"]')),
            this.wait
          )
          .sendKeys('/app/test/fixtures/keystore-keeper.json');

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
          .sendKeys('/app/test/fixtures/keystore-exchange.json');

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
      function extractAccountCheckboxesFromDOM(this: mocha.Context) {
        return this.driver
          .wait(
            until.elementLocated(By.css('[data-testid="chooseAccountsForm"]')),
            this.wait
          )
          .findElements(By.css('[data-testid="accountCard"]'))
          .then(cards =>
            Promise.all(
              cards.map(card =>
                Promise.all([
                  card.getAttribute('title'),
                  card
                    .findElement(By.css('[data-testid="accountName"]'))
                    .getText(),
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
        it('allows to select and import all accounts', async function () {
          await this.driver
            .wait(
              until.elementLocated(By.css('[data-testid="importKeystore"]'))
            )
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/app/test/fixtures/keystore-keeper.json');

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
            until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
            this.wait
          );

          await this.driver
            .findElement(By.css('[data-testid="addAnotherAccountBtn"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(By.css('[data-testid="importForm"]')),
            this.wait
          );

          await this.driver.switchTo().window(tabKeeper);
          await browser.openKeeperPopup();

          await Network.switchToAndCheck('Testnet');

          expect(await PopupHome.getAllAccountNames()).to.have.ordered.members([
            'test',
          ]);

          await Network.switchToAndCheck('Stagenet');

          expect(await PopupHome.getAllAccountNames()).to.have.ordered.members([
            'test4',
          ]);
        });
      });

      describe('when some, but not all accounts already exist', function () {
        it('allows to select only unexisting accounts', async function () {
          await PopupHome.addAccount();

          await this.driver.switchTo().window(tabAccounts);
          await this.driver
            .wait(
              until.elementIsVisible(
                this.driver.wait(
                  until.elementLocated(
                    By.css('[data-testid="importKeystore"]')
                  ),
                  this.wait
                )
              ),
              this.wait
            )
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/app/test/fixtures/keystore-keeper.json');

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
            until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
            this.wait
          );

          await this.driver
            .findElement(By.css('[data-testid="addAnotherAccountBtn"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(By.css('[data-testid="importForm"]')),
            this.wait
          );

          await this.driver.switchTo().window(tabKeeper);
          await browser.openKeeperPopup();

          await Network.switchToAndCheck('Testnet');

          expect(await PopupHome.getAllAccountNames()).to.have.ordered.members([
            'test',
            'test3',
          ]);

          await Network.switchToAndCheck('Stagenet');

          expect(await PopupHome.getAllAccountNames()).to.have.ordered.members([
            'test4',
          ]);

          await Network.switchToAndCheck('Mainnet');

          expect(await PopupHome.getAllAccountNames()).to.have.ordered.members([
            'test2',
          ]);
        });
      });

      describe('when all accounts exist', function () {
        it('does not allow selecting anything and shows the "Skip" button', async function () {
          await PopupHome.addAccount();

          await this.driver.switchTo().window(tabAccounts);
          await this.driver
            .wait(
              until.elementIsVisible(
                this.driver.wait(
                  until.elementLocated(
                    By.css('[data-testid="importKeystore"]')
                  ),
                  this.wait
                )
              ),
              this.wait
            )
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/app/test/fixtures/keystore-keeper.json');

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
            until.elementLocated(By.css('[data-testid="importForm"]')),
            this.wait
          );
        });
      });

      describe('when the user already has an account with the same name, but different address', function () {
        before(async function () {
          await this.driver.switchTo().window(tabKeeper);
        });

        beforeEach(deleteEachAndSwitchToAccounts);

        it('adds suffix to the name', async function () {
          await AccountsHome.importAccount(
            'test2',
            'this is the seed for the test account'
          );

          await this.driver
            .wait(
              until.elementLocated(By.css('[data-testid="importKeystore"]')),
              this.wait
            )
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/app/test/fixtures/keystore-keeper.json');

          await this.driver
            .findElement(By.css('[data-testid="passwordInput"]'))
            .sendKeys('xHZ7Zaxu2wuncWC');
          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          expect(
            await extractAccountCheckboxesFromDOM.call(this)
          ).to.include.deep.members([
            {
              name: 'test2 (1)',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: true,
            },
          ]);

          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
            this.wait
          );

          await this.driver
            .findElement(By.css('[data-testid="addAnotherAccountBtn"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(By.css('[data-testid="importForm"]')),
            this.wait
          );

          await this.driver.switchTo().window(tabKeeper);
          await browser.openKeeperPopup();

          expect(await PopupHome.getAllAccountNames()).to.have.ordered.members([
            'test2',
            'test2 (1)',
          ]);
        });

        it('increments the number in suffix if it already exists', async function () {
          await AccountsHome.importAccount(
            'test2',
            'this is a seed for the test account'
          );

          await AccountsHome.importAccount(
            'test2 (1)',
            'this is an another seed for the test account'
          );

          await this.driver
            .findElement(By.css('[data-testid="importKeystore"]'))
            .click();

          await this.driver
            .findElement(By.css('[data-testid="fileInput"]'))
            .sendKeys('/app/test/fixtures/keystore-keeper.json');

          await this.driver
            .findElement(By.css('[data-testid="passwordInput"]'))
            .sendKeys('xHZ7Zaxu2wuncWC');
          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          expect(
            await extractAccountCheckboxesFromDOM.call(this)
          ).to.include.deep.members([
            {
              name: 'test2 (2)',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: true,
            },
          ]);

          await this.driver
            .findElement(By.css('[data-testid="submitButton"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(By.css('[data-testid="importSuccessForm"]')),
            this.wait
          );

          await this.driver
            .findElement(By.css('[data-testid="addAnotherAccountBtn"]'))
            .click();

          await this.driver.wait(
            until.elementLocated(By.css('[data-testid="importForm"]')),
            this.wait
          );

          await this.driver.switchTo().window(tabKeeper);
          await browser.openKeeperPopup();

          expect(await PopupHome.getAllAccountNames()).to.have.ordered.members([
            'test2 (1)',
            'test2',
            'test2 (2)',
          ]);
        });
      });
    });
  });
});
