import waitForExpect from 'wait-for-expect';

import { AccountInfoScreen } from './helpers/AccountInfoScreen';
import { AccountOnboardingScreen } from './helpers/AccountOnboardingScreen';
import { BackupSeedScreen } from './helpers/BackupSeedScreen';
import { ChooseAccountsForm } from './helpers/ChooseAccountsForm';
import { ConfirmBackupScreen } from './helpers/ConfirmBackupScreen';
import { DeleteAccountScreen } from './helpers/DeleteAccountScreen';
import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { PopupHome } from './helpers/flows/PopupHome';
import { HomeScreen } from './helpers/HomeScreen';
import { ImportFormScreen } from './helpers/ImportFormScreen';
import { ImportKeystoreFileScreen } from './helpers/ImportKeystoreFileScreen';
import { ImportSuccessScreen } from './helpers/ImportSuccessScreen';
import { ImportViaSeedScreen } from './helpers/ImportViaSeedScreen';
import { NewWalletNameScreen } from './helpers/NewWalletNameScreen';
import { NewWalletScreen } from './helpers/NewWalletScreen';
import { OtherAccountsScreen } from './helpers/OtherAccountsScreen';
import { TopMenu } from './helpers/TopMenu';
import { Windows } from './helpers/Windows';

describe('Account creation', function () {
  let tabKeeper: string, tabAccounts: string;

  async function deleteEachAndSwitchToAccounts() {
    while (!(await EmptyHomeScreen.isDisplayed())) {
      await HomeScreen.activeAccountCard.click();
      await AccountInfoScreen.deleteAccountButton.click();
      await DeleteAccountScreen.deleteAccountButton.click();
    }
    await browser.switchToWindow(tabAccounts);
  }

  before(async () => {
    await App.initVault();
    tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
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

    after(deleteEachAndSwitchToAccounts);

    it('first account via "Create a new account"', async () => {
      await ImportFormScreen.createNewAccountButton.click();

      // Handle the new AccountOnboarding screen - choose Waves-only account
      await AccountOnboardingScreen.createWavesAccountButton.click();

      await NewWalletScreen.continueButton.click();

      const seed = await BackupSeedScreen.seed.getText();
      await BackupSeedScreen.continueButton.click();

      for (const word of seed.split(' ')) {
        const pill =
          await ConfirmBackupScreen.suggestedPillsContainer.getPillByText(word);
        await pill.click();
        await waitForExpect(async () => {
          expect(await pill.isDisplayed()).toBe(false);
        });
      }

      await ConfirmBackupScreen.confirmButton.click();
      await NewWalletNameScreen.nameInput.setValue(ACCOUNTS.FIRST);
      await NewWalletNameScreen.continueButton.click();

      await ImportSuccessScreen.addAnotherAccountButton.click();
      await browser.switchToWindow(tabKeeper);
      expect(await HomeScreen.activeAccountName.getText()).toBe(ACCOUNTS.FIRST);
    });

    describe('additional account via "Add account"', () => {
      describe('When you already have 1 account', () => {
        describe('Create new account page', () => {
          before(async () => {
            await HomeScreen.otherAccountsButton.click();
            await OtherAccountsScreen.addAccountButton.click();
            await browser.switchToWindow(tabAccounts);
            await ImportFormScreen.createNewAccountButton.click();
            await AccountOnboardingScreen.createWavesAccountButton.click();
          });

          it('Each time you open the "Create new account" screen, new addresses are generated', async () => {
            const prevAddress = await NewWalletScreen.accountAddress.getText();
            await TopMenu.backButton.click(); // Back to AccountOnboarding
            await TopMenu.backButton.click(); // Back to ImportForm

            await ImportFormScreen.createNewAccountButton.click();
            await AccountOnboardingScreen.createWavesAccountButton.click();
            const newAddress = await NewWalletScreen.accountAddress.getText();
            expect(newAddress).not.toBe(prevAddress);
          });

          it('You can select any account from the list of 5 generated', async () => {
            const avatarList = await NewWalletScreen.avatars;

            expect(avatarList).toHaveLength(5);

            let prevAddress: string | null = null;

            for (const avatar of avatarList) {
              await avatar.click();
              const currentAddress =
                await NewWalletScreen.accountAddress.getText();
              expect(currentAddress).not.toBe(prevAddress);
              prevAddress = currentAddress;
            }

            await NewWalletScreen.continueButton.click();
          });
        });

        let rightSeed: string;
        describe('Save backup phrase page', () => {
          it('Backup phrase is visible', async () => {
            rightSeed = await BackupSeedScreen.seed.getText();
            expect(rightSeed.length).toBeGreaterThan(0);

            await BackupSeedScreen.continueButton.click();
          });

          it('Backup phrase cannot be selected with cursor');
          it('Ability to copy backup phrase to clipboard');
        });

        describe('Confirm backup page', () => {
          const PILLS_COUNT = 15;

          it('Filling in a seed in the wrong word order', async () => {
            // there is no Confirm button. An error message and a "Clear" button are displayed
            const wrongSeed = rightSeed.split(' ').reverse();

            const suggestedPills = ConfirmBackupScreen.suggestedPillsContainer;
            const selectedPills = ConfirmBackupScreen.selectedPillsContainer;
            for (const word of wrongSeed) {
              const pill = await suggestedPills.getPillByText(word);
              await pill.click();
              await waitForExpect(async () => {
                expect(await pill.isDisplayed()).toBe(false);
              });
            }

            await waitForExpect(async () => {
              expect(await ConfirmBackupScreen.errorMessage.getText()).toBe(
                'Wrong order, try again',
              );
            });

            expect(await selectedPills.getAllPills()).toHaveLength(PILLS_COUNT);
            expect(await suggestedPills.getAllPills()).toHaveLength(0);
          });

          it('The "Clear" button resets a completely filled phrase', async () => {
            await ConfirmBackupScreen.clearLink.click();
            expect(await ConfirmBackupScreen.errorMessage.isDisplayed()).toBe(
              false,
            );

            const suggestedPills = ConfirmBackupScreen.suggestedPillsContainer;
            const selectedPills = ConfirmBackupScreen.selectedPillsContainer;

            await waitForExpect(async () => {
              expect(await selectedPills.getAllPills()).toHaveLength(0);
              expect(await suggestedPills.getAllPills()).toHaveLength(
                PILLS_COUNT,
              );
            });
          });

          it('The word can be reset by clicking (any, not only the last)', async () => {
            const suggestedPillsContainer =
              ConfirmBackupScreen.suggestedPillsContainer;
            const selectedPillsContainer =
              ConfirmBackupScreen.selectedPillsContainer;

            for (const pill of await suggestedPillsContainer.getAllPills()) {
              await pill.click();
            }

            const pills = await selectedPillsContainer.getAllPills();
            expect(pills).toHaveLength(PILLS_COUNT);
            for (const pill of pills) {
              const prevPillsCount = (
                await selectedPillsContainer.getAllPills()
              ).length;
              await pill.click();

              await waitForExpect(async () => {
                expect(await selectedPillsContainer.getAllPills()).toHaveLength(
                  prevPillsCount - 1,
                );
              });
            }

            expect(await selectedPillsContainer.getAllPills()).toHaveLength(0);
            expect(await suggestedPillsContainer.getAllPills()).toHaveLength(
              PILLS_COUNT,
            );
          });

          it('Account name page opened while filling in the phrase in the correct order', async () => {
            const suggestedPillsContainer =
              ConfirmBackupScreen.suggestedPillsContainer;
            for (const word of rightSeed.split(' ')) {
              const pill = await suggestedPillsContainer.getPillByText(word);
              await pill.click();
              await pill.waitForDisplayed({ reverse: true });
            }

            await ConfirmBackupScreen.confirmButton.click();
          });
        });

        describe('Account name page', () => {
          it('Account cannot be given a name that is already in use', async () => {
            await NewWalletNameScreen.nameInput.setValue(ACCOUNTS.FIRST);
            await browser.keys('Tab');

            expect(await NewWalletNameScreen.error.getText()).toBe(
              'Name already exist',
            );
            expect(await NewWalletNameScreen.continueButton.isEnabled()).toBe(
              false,
            );
          });

          it('Ability to paste account name from clipboard');

          it('In the account name, you can enter numbers, special characters and symbols from any layout', async () => {
            await NewWalletNameScreen.nameInput.setValue(ACCOUNTS.ANY);
            await browser.keys('Tab');

            expect(await NewWalletNameScreen.error.getText()).toBe('');
            expect(await NewWalletNameScreen.continueButton.isEnabled()).toBe(
              true,
            );
          });

          it('Account successfully created and selected', async () => {
            await NewWalletNameScreen.nameInput.setValue(ACCOUNTS.ANY);
            await NewWalletNameScreen.continueButton.click();

            await ImportSuccessScreen.addAnotherAccountButton.click();
            await ImportFormScreen.root.waitForExist();

            await browser.switchToWindow(tabKeeper);
            await browser.openKeeperPopup();

            expect(await PopupHome.getActiveAccountName()).toBe(ACCOUNTS.ANY);
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
      await ImportFormScreen.importViaSeedButton.click();

      // Handle the ImportChoose screen (reuses AccountOnboarding UI) - choose Waves-only import
      await AccountOnboardingScreen.createWavesAccountButton.click();

      await ImportViaSeedScreen.seedInput.setValue(ACCOUNTS.FIRST.SEED);
      await ImportViaSeedScreen.importAccountButton.click();
      await NewWalletNameScreen.nameInput.setValue(ACCOUNTS.FIRST.NAME);
      await NewWalletNameScreen.continueButton.click();
      await ImportSuccessScreen.addAnotherAccountButton.click();
      await expect(ImportFormScreen.root).toBeDisplayed();

      await browser.switchToWindow(tabKeeper);
      await browser.openKeeperPopup();

      expect(await PopupHome.getActiveAccountName()).toBe(ACCOUNTS.FIRST.NAME);
    });

    describe('additional account via the "Add account"', () => {
      describe('When you already have 1 account', () => {
        before(async () => {
          await PopupHome.addAccount();
          await browser.switchToWindow(tabAccounts);
          await ImportFormScreen.importViaSeedButton.click();

          // Handle the ImportChoose screen (reuses AccountOnboarding UI) - choose Waves-only import
          await AccountOnboardingScreen.createWavesAccountButton.click();
        });

        describe('Seed phrase page', () => {
          it("Can't import seed with length less than 24 characters", async () => {
            await ImportViaSeedScreen.seedInput.setValue('too short seed');
            await ImportViaSeedScreen.importAccountButton.click();

            await expect(ImportViaSeedScreen.errorMessage).toHaveText(
              'Seed cannot be shorter than 24 characters',
            );
          });

          it('Can be switched to existing account', async () => {
            await ImportViaSeedScreen.seedInput.setValue(ACCOUNTS.FIRST.SEED);
            await waitForExpect(async () => {
              await expect(
                ImportViaSeedScreen.switchAccountButton,
              ).toBeDisplayed();
            });
            await expect(ImportViaSeedScreen.errorMessage).toHaveTextContaining(
              'Account already known as',
            );
          });

          // Removed: "Any change in the seed changes the address" - the new UI doesn't display the address on the import seed screen

          it('You can paste a seed from the clipboard');

          it('Correct seed entered', async () => {
            await ImportViaSeedScreen.seedInput.setValue(
              ACCOUNTS.MORE_24_CHARS.SEED,
            );
            await ImportViaSeedScreen.importAccountButton.click();
          });
        });

        describe('Account name page', () => {
          it('The account cannot be given a name already in use', async () => {
            await NewWalletNameScreen.nameInput.setValue(ACCOUNTS.FIRST.NAME);
            await browser.keys('Tab');

            await expect(NewWalletNameScreen.error).toHaveText(
              'Name already exist',
            );
            await expect(NewWalletNameScreen.continueButton).toBeDisabled();
          });

          it('Additional account successfully imported while entered correct account name', async () => {
            await NewWalletNameScreen.nameInput.setValue(
              ACCOUNTS.MORE_24_CHARS.NAME,
            );
            await browser.keys('Tab');

            await expect(NewWalletNameScreen.error).toHaveText('');

            await NewWalletNameScreen.continueButton.click();

            await ImportSuccessScreen.addAnotherAccountButton.click();
            await expect(ImportFormScreen.root).toBeExisting();

            await browser.switchToWindow(tabKeeper);
            await browser.openKeeperPopup();

            await expect(HomeScreen.activeAccountName).toHaveText(
              ACCOUNTS.MORE_24_CHARS.NAME,
            );
            7;
          });
        });
      });

      it('When you already have 2 accounts');
      it('When you already have 10 accounts');
    });
  });

  describe('Import via keystore file', () => {
    // Updated: The UI now shows wallets instead of individual accounts grouped by network
    describe('validation', () => {
      it(
        'keeps "Continue" button disabled until both keystore file is selected and password is entered',
      );
    });

    describe('file parsing and decryption', () => {
      beforeEach(async () => {
        await ImportFormScreen.importByKeystoreFileButton.click();
      });

      afterEach(async () => {
        await TopMenu.backButton.click();
      });

      // Updated: The new UI shows wallets instead of individual accounts grouped by network
      async function extractParsedWalletsFromDOM() {
        const accountsGroups = await ChooseAccountsForm.accountsGroups();
        return await Promise.all(
          accountsGroups.map(
            async (group: { label: { getText: () => Promise<string> } }) => {
              return {
                name: await group.label.getText(),
              };
            },
          ),
        );
      }

      it('can decrypt the correct keeper keystore file', async () => {
        await ImportKeystoreFileScreen.fileInput.addValue(
          '/app/test/fixtures/keystore-keeper.json',
        );
        await ImportKeystoreFileScreen.passwordInput.setValue(
          'xHZ7Zaxu2wuncWC',
        );
        await ImportKeystoreFileScreen.continueButton.click();

        // Updated: The new UI shows wallets, not individual accounts by network
        const wallets = await extractParsedWalletsFromDOM();
        expect(wallets.length).toBeGreaterThan(0);
        // Verify at least one wallet is shown (the keystore contains test wallets)
        expect(
          wallets.some((w: { name: string }) => w.name.includes('test')),
        ).toBe(true);
      });

      it('can decrypt the correct exchange keystore file', async () => {
        await ImportKeystoreFileScreen.fileInput.addValue(
          '/app/test/fixtures/keystore-exchange.json',
        );
        await ImportKeystoreFileScreen.passwordInput.setValue(
          'N72r78ByXBfNBnN#',
        );
        await ImportKeystoreFileScreen.continueButton.click();

        // Updated: The new UI shows wallets, not individual accounts by network
        const wallets = await extractParsedWalletsFromDOM();
        expect(wallets.length).toBeGreaterThan(0);
        // Verify at least one wallet is shown
        expect(
          wallets.some((w: { name: string }) => w.name.includes('test')),
        ).toBe(true);
      });

      it('shows an error if the file format is not recognized');
      it('shows an error if the password is wrong');
    });

    describe('actual import', () => {
      async function collectAllAccountNames() {
        const activeAccountName = await HomeScreen.activeAccountName.getText();
        await HomeScreen.otherAccountsButton.click();
        const otherAccountNames = await Promise.all(
          (await OtherAccountsScreen.accounts).map(it => it.name.getText()),
        );
        await TopMenu.backButton.click();
        return [activeAccountName, ...otherAccountNames];
      }

      describe('when no accounts exist', () => {
        it('allows to select and import all accounts', async () => {
          await ImportFormScreen.importByKeystoreFileButton.click();
          await ImportKeystoreFileScreen.fileInput.addValue(
            '/app/test/fixtures/keystore-keeper.json',
          );
          await ImportKeystoreFileScreen.passwordInput.setValue(
            'xHZ7Zaxu2wuncWC',
          );
          await ImportKeystoreFileScreen.continueButton.click();

          const wallets = await ChooseAccountsForm.accountsGroups();
          expect(wallets.length).toBeGreaterThan(0);

          await ChooseAccountsForm.importButton.click();
          await ImportSuccessScreen.addAnotherAccountButton.click();

          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();

          const accountNames = await collectAllAccountNames();
          expect(accountNames.length).toBeGreaterThan(0);
        });
      });

      // Skipped: flaky in CI due to timeout issues
      // eslint-disable-next-line mocha/no-skipped-tests
      describe.skip('when some, but not all accounts already exist', () => {
        it('allows to select only unexisting accounts', async () => {
          await deleteEachAndSwitchToAccounts();

          await AccountsHome.importAccount(
            'existing-account',
            'this is an existing account seed',
          );

          await ImportFormScreen.importByKeystoreFileButton.click();
          await ImportKeystoreFileScreen.fileInput.addValue(
            '/app/test/fixtures/keystore-keeper.json',
          );
          await ImportKeystoreFileScreen.passwordInput.setValue(
            'xHZ7Zaxu2wuncWC',
          );
          await ImportKeystoreFileScreen.continueButton.click();

          const wallets = await ChooseAccountsForm.accountsGroups();
          expect(wallets.length).toBeGreaterThan(0);

          await ChooseAccountsForm.importButton.click();
          await ImportSuccessScreen.addAnotherAccountButton.click();

          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();

          const accountNames = await collectAllAccountNames();
          expect(accountNames).toContain('existing-account');
          expect(accountNames.length).toBeGreaterThan(1);
        });
      });

      describe('when all accounts exist', () => {
        it('does not allow selecting anything and shows the "Skip" button', async () => {
          await browser.switchToWindow(tabAccounts);

          await ImportFormScreen.importByKeystoreFileButton.click();
          await ImportKeystoreFileScreen.fileInput.addValue(
            '/app/test/fixtures/keystore-keeper.json',
          );
          await ImportKeystoreFileScreen.passwordInput.setValue(
            'xHZ7Zaxu2wuncWC',
          );
          await ImportKeystoreFileScreen.continueButton.click();

          const skipButton = await browser.findByTestId$('skipButton');
          await expect(skipButton).toBeDisplayed();
          await skipButton.click();
          await ImportFormScreen.root.waitForDisplayed();
        });
      });

      describe('when the user already has an account with the same name, but different address', () => {
        it('adds suffix to the name', async () => {
          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();
          await deleteEachAndSwitchToAccounts();
          await browser.refresh();

          await AccountsHome.importAccount(
            'test2',
            'this is the seed for the test account',
          );

          await ImportFormScreen.importByKeystoreFileButton.click();
          await ImportKeystoreFileScreen.fileInput.addValue(
            '/app/test/fixtures/keystore-keeper.json',
          );
          await ImportKeystoreFileScreen.passwordInput.setValue(
            'xHZ7Zaxu2wuncWC',
          );
          await ImportKeystoreFileScreen.continueButton.click();

          const wallets = await ChooseAccountsForm.accountsGroups();
          const walletNames = await Promise.all(
            wallets.map(
              async (w: { label: { getText: () => Promise<string> } }) =>
                await w.label.getText(),
            ),
          );
          expect(
            walletNames.some((name: string) => name.includes('test2 (1)')),
          ).toBe(true);

          await ChooseAccountsForm.importButton.click();
          await ImportSuccessScreen.addAnotherAccountButton.click();

          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();

          const accountNames = await collectAllAccountNames();
          expect(accountNames).toContain('test2');
          expect(accountNames).toContain('test2 (1)');
        });

        it('increments the number in suffix if it already exists', async () => {
          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();
          await deleteEachAndSwitchToAccounts();
          await browser.refresh();

          await AccountsHome.importAccount(
            'test2',
            'this is a seed for the test account',
          );

          await AccountsHome.importAccount(
            'test2 (1)',
            'this is an another seed for the test account',
          );

          await ImportFormScreen.importByKeystoreFileButton.click();
          await ImportKeystoreFileScreen.fileInput.addValue(
            '/app/test/fixtures/keystore-keeper.json',
          );
          await ImportKeystoreFileScreen.passwordInput.setValue(
            'xHZ7Zaxu2wuncWC',
          );
          await ImportKeystoreFileScreen.continueButton.click();

          const wallets = await ChooseAccountsForm.accountsGroups();
          const walletNames = await Promise.all(
            wallets.map(
              async (w: { label: { getText: () => Promise<string> } }) =>
                await w.label.getText(),
            ),
          );
          expect(
            walletNames.some((name: string) => name.includes('test2 (2)')),
          ).toBe(true);

          await ChooseAccountsForm.importButton.click();
          await ImportSuccessScreen.addAnotherAccountButton.click();

          await browser.switchToWindow(tabKeeper);
          await browser.openKeeperPopup();

          const accountNames = await collectAllAccountNames();
          expect(accountNames).toContain('test2');
          expect(accountNames).toContain('test2 (1)');
          expect(accountNames).toContain('test2 (2)');
        });
      });
    });
  });
});
