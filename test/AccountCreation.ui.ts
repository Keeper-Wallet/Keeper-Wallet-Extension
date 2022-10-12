import { expect } from 'chai';

import {
  AccountsHome,
  App,
  Network,
  PopupHome,
  Settings,
  Windows,
} from './utils/actions';

describe('Account creation', function () {
  this.timeout(60 * 1000);

  let tabKeeper: string, tabAccounts: string;

  async function deleteEachAndSwitchToAccounts() {
    const repeat = true;

    while (repeat) {
      await $(
        '[data-testid="assetsForm"], [data-testid="importForm"]'
      ).waitForExist();

      const activeAccountCards = await $$('[data-testid="activeAccountCard"]');

      if (!activeAccountCards.length) {
        break; // the cycle
      }

      await activeAccountCards[0].click();

      await $("//div[contains(@class, 'deleteButton@accountInfo')]").click();
      await $('#deleteAccount').click();
    }

    await $('[data-testid="importForm"]').waitForExist();
    await browser.switchToWindow(tabAccounts);
  }

  before(async () => {
    await App.initVault();
    await Settings.setMaxSessionTimeout();
    await browser.openKeeperPopup();
    tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await $('[data-testid="addAccountBtn"]').click();
    [tabAccounts] = await waitForNewWindows(1);
    await browser.switchToWindow(tabAccounts);
    await browser.refresh();
  });

  after(async () => {
    await browser.switchToWindow(tabAccounts);
    await browser.closeWindow();
    await browser.switchToWindow(tabKeeper);
    await App.resetVault();
  });

  describe('Create', () => {
    const ACCOUNTS = {
      FIRST: 'first',
      SECOND: 'second',
      ANY: 'account123!@#_аккаунт',
    };
    const PILL_ANIMATION_DELAY = 200;

    after(deleteEachAndSwitchToAccounts);

    it('first account via "Create a new account"', async () => {
      await $('[data-testid="createNewAccountBtn"]').click();
      await $('#continue').click();

      const seed = await $('div.cant-select').getText();
      await $('#continue').click();

      for (const word of seed.split(' ')) {
        await $(
          "//div[(contains(@class, 'selectedPill@pills') and not(contains(@class, 'hiddenPill@pills')))]" +
            `//div[contains(@class, 'text@pills')][text()='${word}']`
        ).click();

        await browser.pause(PILL_ANIMATION_DELAY);
      }

      await $('#confirmBackup').click();

      await $('[data-testid="newAccountNameInput"]').setValue(ACCOUNTS.FIRST);
      await $('[data-testid="continueBtn"]').click();

      await $('[data-testid="addAnotherAccountBtn"]').click();

      await browser.switchToWindow(tabKeeper);
      expect(await PopupHome.getActiveAccountName()).to.equal(ACCOUNTS.FIRST);
    });

    describe('additional account via "Add account"', () => {
      describe('When you already have 1 account', () => {
        describe('Create new account page', () => {
          before(async () => {
            await PopupHome.addAccount();
            await browser.switchToWindow(tabAccounts);
            await $('[data-testid="createNewAccountBtn"]').click();
          });

          it('Each time you open the "Create new account" screen, new addresses are generated', async () => {
            const prevAddress = await $(
              "//div[contains(@class, 'greyLine@newwallet')]"
            ).getText();

            await $('div.arrow-back-icon').click();

            await $('[data-testid="createNewAccountBtn"]').click();

            expect(
              await $("//div[contains(@class, 'greyLine@newwallet')]").getText()
            ).not.to.be.equal(prevAddress);
          });

          it('You can select any account from the list of 5 generated', async () => {
            const avatarList = await $$(
              "//div[contains(@class, 'avatar@avatar')]"
            );
            expect(avatarList).to.have.length(5);

            const addressEl = await $(
              "//div[contains(@class, 'greyLine@newwallet')]"
            );

            let prevAddress: string | null = null;

            for (const avatar of avatarList) {
              await avatar.click();
              const currentAddress = await addressEl.getText();
              expect(currentAddress).not.to.equal(prevAddress);
              prevAddress = currentAddress;
            }

            await $('#continue').click();
          });
        });

        let rightSeed: string;
        describe('Save backup phrase page', () => {
          it('Backup phrase is visible', async () => {
            const seedEl = await $('div.cant-select');
            await seedEl.waitForDisplayed();
            rightSeed = await seedEl.getText();
            expect(rightSeed).to.be.not.empty;

            await $('#continue').click();
          });

          it('Backup phrase cannot be selected with cursor');
          it('Ability to copy backup phrase to clipboard');
        });

        describe('Confirm backup page', () => {
          const xpWriteVisiblePill =
            "//div[(contains(@class, 'selectedPill@pills') and not(contains(@class, 'hiddenPill@pills')))]";

          const xpReadVisiblePill =
            "//div[(contains(@class, 'pill@pills') and not(contains(@class, 'selectedPill@pills')) and not(contains(@class, 'hiddenPill@pills')))]";

          const PILLS_COUNT = 15;

          it('Filling in a seed in the wrong word order', async () => {
            // there is no Confirm button. An error message and a "Clear" button are displayed
            const wrongSeed = rightSeed.split(' ').reverse();

            for (const word of wrongSeed) {
              await $(
                `${xpWriteVisiblePill}//div[contains(@class, 'text@pills')][text()='${word}']`
              ).click();

              await browser.pause(PILL_ANIMATION_DELAY);
            }

            const errorEl = $("//div[contains(@class, 'error@error')]");
            await errorEl.waitForDisplayed();
            expect(await errorEl.getText()).to.equal('Wrong order, try again');

            await $(
              "//div[contains(@class, 'clearSeed@confirmBackup')]"
            ).waitForDisplayed();

            expect(await $$(xpReadVisiblePill)).to.have.length(PILLS_COUNT);
            expect(await $$(xpWriteVisiblePill)).to.have.length(0);
          });

          it('The "Clear" button resets a completely filled phrase', async () => {
            await $(
              "//div[contains(@class, 'clearSeed@confirmBackup')]"
            ).click();

            await browser.pause(PILL_ANIMATION_DELAY);

            expect(await $$("//div[contains(@class, 'error@error')]")).to.be
              .empty;

            expect(
              await $$("//div[contains(@class, 'clearSeed@confirmBackup')]")
            ).to.be.empty;

            expect(await $$(xpReadVisiblePill)).to.be.empty;
            expect(await $$(xpWriteVisiblePill)).length(PILLS_COUNT);
          });

          it('The word can be reset by clicking (any, not only the last)', async () => {
            const writePills = await $$(xpWriteVisiblePill);

            for (const writePill of writePills) {
              await writePill.click();
              await browser.pause(PILL_ANIMATION_DELAY);
            }

            await $(
              "//div[contains(@class, 'clearSeed@confirmBackup')]"
            ).waitForDisplayed();

            expect(await $$(xpReadVisiblePill)).to.have.length(PILLS_COUNT);
            expect(await $$(xpWriteVisiblePill)).to.be.empty;

            const readPills = await $$(
              "//div[contains(@class, 'readSeed@confirmBackup')]" +
                "//div[(contains(@class, 'pill@pills') and not(contains(@class, 'hiddenPill@pills')))]"
            );

            for (const readPill of readPills) {
              await readPill.click();
              await browser.pause(PILL_ANIMATION_DELAY);
            }

            expect(await $$(xpReadVisiblePill)).to.be.empty;
            expect(await $$(xpWriteVisiblePill)).to.have.length(PILLS_COUNT);
          });

          it('Account name page opened while filling in the phrase in the correct order', async () => {
            for (const word of rightSeed.split(' ')) {
              await $(
                `${xpWriteVisiblePill}//div[contains(@class, 'text@pills')][text()='${word}']`
              ).click();

              await browser.pause(PILL_ANIMATION_DELAY);
            }

            await $('#confirmBackup').click();
          });
        });

        describe('Account name page', () => {
          it('Account cannot be given a name that is already in use', async () => {
            await $('[data-testid="newAccountNameInput"]').setValue(
              ACCOUNTS.FIRST
            );

            await browser.keys('Tab');

            expect(
              await $('[data-testid="newAccountNameError"]').getText()
            ).matches(/name already exist/i);

            expect(await $('[data-testid="continueBtn"]').isEnabled()).to.be
              .false;
          });

          it('Ability to paste account name from clipboard');

          it('In the account name, you can enter numbers, special characters and symbols from any layout', async () => {
            await $('[data-testid="newAccountNameInput"]').setValue(
              ACCOUNTS.ANY
            );

            await browser.keys('Tab');

            expect(await $('[data-testid="newAccountNameError"]').getText()).to
              .be.empty;
            expect(await $('[data-testid="continueBtn"]').isEnabled()).to.be
              .true;
          });

          it('Account successfully created and selected', async () => {
            await $('[data-testid="newAccountNameInput"]').setValue(
              ACCOUNTS.ANY
            );

            await $('[data-testid="continueBtn"]').click();

            await $('[data-testid="importSuccessForm"]').waitForExist();
            await $('[data-testid="addAnotherAccountBtn"]').click();
            await $('[data-testid="importForm"]').waitForExist();

            await browser.switchToWindow(tabKeeper);
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

  describe('Import via seed', () => {
    const ACCOUNTS = {
      FIRST: { SEED: 'this is first account seed', NAME: 'first' },
      MORE_24_CHARS: {
        SEED: 'there is more than 24 characters',
        NAME: 'more than 24 characters',
      },
    };

    after(deleteEachAndSwitchToAccounts);

    it('first account via "Import account"', async () => {
      await $('[data-testid="importSeed"]').click();

      await $('[data-testid="seedInput"]').setValue(ACCOUNTS.FIRST.SEED);
      await $('[data-testid="continueBtn"]').click();

      await $('[data-testid="newAccountNameInput"]').setValue(
        ACCOUNTS.FIRST.NAME
      );
      await $('[data-testid="continueBtn"]').click();

      await $('[data-testid="importSuccessForm"]').waitForExist();
      await $('[data-testid="addAnotherAccountBtn"]').click();

      await $('[data-testid="importForm"]').waitForExist();

      await browser.switchToWindow(tabKeeper);
      await browser.openKeeperPopup();

      expect(await PopupHome.getActiveAccountName()).to.be.equals(
        ACCOUNTS.FIRST.NAME
      );
    });

    describe('additional account via the "Add account"', () => {
      describe('When you already have 1 account', () => {
        before(async () => {
          await PopupHome.addAccount();
          await browser.switchToWindow(tabAccounts);
          await $('[data-testid="importSeed"]').click();
        });

        describe('Seed phrase page', () => {
          it("Can't import seed with length less than 24 characters", async () => {
            await $('[data-testid="seedInput"]').setValue('too short seed');
            await $('[data-testid="continueBtn"]').click();

            expect(
              await $('[data-testid="validationError"]').getText()
            ).to.equal('Seed cannot be shorter than 24 characters');
          });

          it('Can be switched to existing account', async () => {
            await $('[data-testid="seedInput"]').setValue(ACCOUNTS.FIRST.SEED);

            expect(await $('[data-testid="continueBtn"]').getText()).matches(
              /switch account/i
            );

            expect(
              await $('[data-testid="validationError"]').getText()
            ).matches(/Account already known as .+/i);
          });

          it('Any change in the seed changes the address', async () => {
            // input seed
            await $('[data-testid="seedInput"]').setValue(
              ACCOUNTS.MORE_24_CHARS.SEED
            );

            let prevAddress = await $('[data-testid="address"]').getText();

            // insert char
            await $('[data-testid="seedInput"]').addValue('W');
            expect(await $('[data-testid="address"]').getText()).not.to.equal(
              prevAddress
            );
            prevAddress = await $('[data-testid="address"]').getText();

            // delete inserted char
            await browser.keys('Backspace');
            expect(await $('[data-testid="address"]').getText()).not.to.equal(
              prevAddress
            );
          });

          it('You can paste a seed from the clipboard');

          it('Correct seed entered', async () => {
            await $('[data-testid="seedInput"]').setValue(
              ACCOUNTS.MORE_24_CHARS.SEED
            );

            await $('[data-testid="continueBtn"]').click();
          });
        });

        describe('Account name page', () => {
          it('The account cannot be given a name already in use', async () => {
            await $('[data-testid="newAccountNameInput"]').setValue(
              ACCOUNTS.FIRST.NAME
            );
            await browser.keys('Tab');

            expect(
              await $('[data-testid="newAccountNameError"]').getText()
            ).matches(/name already exist/i);

            expect(await $('[data-testid="continueBtn"]').isEnabled()).to.be
              .false;
          });

          it('Additional account successfully imported while entered correct account name', async () => {
            await $('[data-testid="newAccountNameInput"]').setValue(
              ACCOUNTS.MORE_24_CHARS.NAME
            );
            await browser.keys('Tab');

            expect($('[data-testid="newAccountNameError"]').getText()).to.be
              .empty;

            await $('[data-testid="continueBtn"]').click();

            await $('[data-testid="addAnotherAccountBtn"]').click();

            await $('[data-testid="importForm"]').waitForExist();

            await browser.switchToWindow(tabKeeper);
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

  describe('Import via keystore file', () => {
    describe('validation', () => {
      it(
        'keeps "Continue" button disabled until both keystore file is selected and password is entered'
      );
    });

    describe('file parsing and decryption', () => {
      beforeEach(async () => {
        await $('[data-testid="importKeystore"]').click();
      });

      afterEach(async () => {
        await $("//div[contains(@class, 'arrowBackIcon@menu')]").click();
      });

      function extractParsedAccountsFromDOM() {
        return $$('[data-testid="accountsGroup"]').map(group =>
          Promise.all([
            group.$('[data-testid="accountsGroupLabel"]').getText(),
            group
              .$$('[data-testid="accountCard"]')
              .map(card =>
                Promise.all([
                  card.$('[data-testid="accountName"]').getText(),
                  card.getAttribute('title'),
                ]).then(([name, address]) => ({ name, address }))
              ),
          ]).then(([label, accounts]) => ({ label, accounts }))
        );
      }

      it('can decrypt the correct keeper keystore file', async () => {
        await $('[data-testid="fileInput"]').addValue(
          '/app/test/fixtures/keystore-keeper.json'
        );

        await $('[data-testid="passwordInput"]').setValue('xHZ7Zaxu2wuncWC');
        await $('[data-testid="submitButton"]').click();

        expect(await extractParsedAccountsFromDOM()).to.deep.equal([
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

      it('can decrypt the correct exchange keystore file', async () => {
        await $('[data-testid="fileInput"]').addValue(
          '/app/test/fixtures/keystore-exchange.json'
        );

        await $('[data-testid="passwordInput"]').setValue('N72r78ByXBfNBnN#');
        await $('[data-testid="submitButton"]').click();

        expect(await extractParsedAccountsFromDOM()).to.deep.equal([
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

    describe('actual import', () => {
      function extractAccountCheckboxesFromDOM() {
        return $$('[data-testid="accountCard"]').map(card =>
          Promise.all([
            card.getAttribute('title'),
            card.$('[data-testid="accountName"]').getText(),
            card
              .$('[name="selected"]')
              .isSelected()
              .catch(() => null),
          ]).then(([address, name, selected]) => ({ address, name, selected }))
        );
      }

      describe('when no accounts exist', () => {
        it('allows to select and import all accounts', async () => {
          await $('[data-testid="importKeystore"]').click();

          await $('[data-testid="fileInput"]').addValue(
            '/app/test/fixtures/keystore-keeper.json'
          );

          await $('[data-testid="passwordInput"]').setValue('xHZ7Zaxu2wuncWC');
          await $('[data-testid="submitButton"]').click();

          expect(
            await extractAccountCheckboxesFromDOM()
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

          await $(
            'input[type="checkbox"][value="3Mxpfxhrwyn4ynCi7WpogBQ8ccP2iD86jNi"]'
          ).click();

          await $(
            'input[type="checkbox"][value="3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r"]'
          ).click();

          expect(
            await extractAccountCheckboxesFromDOM()
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

          await $('[data-testid="submitButton"]').click();
          await $('[data-testid="addAnotherAccountBtn"]').click();

          await browser.switchToWindow(tabKeeper);
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

      describe('when some, but not all accounts already exist', () => {
        it('allows to select only unexisting accounts', async () => {
          await PopupHome.addAccount();

          await browser.switchToWindow(tabAccounts);
          await $('[data-testid="importKeystore"]').click();

          await $('[data-testid="fileInput"]').addValue(
            '/app/test/fixtures/keystore-keeper.json'
          );

          await $('[data-testid="passwordInput"]').setValue('xHZ7Zaxu2wuncWC');
          await $('[data-testid="submitButton"]').click();

          expect(
            await extractAccountCheckboxesFromDOM()
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

          await $('[data-testid="submitButton"]').click();
          await $('[data-testid="addAnotherAccountBtn"]').click();

          await browser.switchToWindow(tabKeeper);
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

      describe('when all accounts exist', () => {
        it('does not allow selecting anything and shows the "Skip" button', async () => {
          await PopupHome.addAccount();

          await browser.switchToWindow(tabAccounts);
          await $('[data-testid="importKeystore"]').click();

          await $('[data-testid="fileInput"]').addValue(
            '/app/test/fixtures/keystore-keeper.json'
          );

          await $('[data-testid="passwordInput"]').setValue('xHZ7Zaxu2wuncWC');
          await $('[data-testid="submitButton"]').click();

          expect(
            await extractAccountCheckboxesFromDOM()
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

          await $('[data-testid="skipButton"]').click();
          await $('[data-testid="importForm"]').waitForExist();
        });
      });

      describe('when the user already has an account with the same name, but different address', () => {
        before(async () => {
          await browser.switchToWindow(tabKeeper);
        });

        beforeEach(deleteEachAndSwitchToAccounts);

        it('adds suffix to the name', async () => {
          await AccountsHome.importAccount(
            'test2',
            'this is the seed for the test account'
          );

          await $('[data-testid="importKeystore"]').click();

          await $('[data-testid="fileInput"]').addValue(
            '/app/test/fixtures/keystore-keeper.json'
          );

          await $('[data-testid="passwordInput"]').setValue('xHZ7Zaxu2wuncWC');
          await $('[data-testid="submitButton"]').click();

          expect(
            await extractAccountCheckboxesFromDOM()
          ).to.include.deep.members([
            {
              name: 'test2 (1)',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: true,
            },
          ]);

          await $('[data-testid="submitButton"]').click();
          await $('[data-testid="addAnotherAccountBtn"]').click();

          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();

          expect(await PopupHome.getAllAccountNames()).to.have.ordered.members([
            'test2',
            'test2 (1)',
          ]);
        });

        it('increments the number in suffix if it already exists', async () => {
          await AccountsHome.importAccount(
            'test2',
            'this is a seed for the test account'
          );

          await AccountsHome.importAccount(
            'test2 (1)',
            'this is an another seed for the test account'
          );

          await $('[data-testid="importKeystore"]').click();

          await $('[data-testid="fileInput"]').addValue(
            '/app/test/fixtures/keystore-keeper.json'
          );

          await $('[data-testid="passwordInput"]').setValue('xHZ7Zaxu2wuncWC');
          await $('[data-testid="submitButton"]').click();

          expect(
            await extractAccountCheckboxesFromDOM()
          ).to.include.deep.members([
            {
              name: 'test2 (2)',
              address: '3PCj4z3TZ1jqZ7A9zYBoSbHnvRqFq2uy89r',
              selected: true,
            },
          ]);

          await $('[data-testid="submitButton"]').click();

          await $('[data-testid="addAnotherAccountBtn"]').click();

          await browser.switchToWindow(tabKeeper);
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
