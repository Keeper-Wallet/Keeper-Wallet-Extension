import { ChooseAccountsForm } from '../ChooseAccountsForm';
import { ImportFormScreen } from '../ImportFormScreen';
import { ImportKeystoreFileScreen } from '../ImportKeystoreFileScreen';
import { ImportSuccessScreen } from '../ImportSuccessScreen';
import { ImportViaSeedScreen } from '../ImportViaSeedScreen';
import { NewWalletNameScreen } from '../NewWalletNameScreen';

export const AccountsHome = {
  importAccount: async (name: string, seed: string) => {
    await ImportFormScreen.importViaSeedButton.click();

    await ImportViaSeedScreen.seedInput.setValue(seed);
    await ImportViaSeedScreen.importAccountButton.click();

    await NewWalletNameScreen.nameInput.setValue(name);
    await NewWalletNameScreen.continueButton.click();

    await ImportSuccessScreen.addAnotherAccountButton.click();
    await ImportFormScreen.root.waitForDisplayed();
  },

  importKeystoreFile: async (path: string, password: string) => {
    await ImportFormScreen.importByKeystoreFileButton.click();
    await ImportKeystoreFileScreen.fileInput.addValue(path);
    await ImportKeystoreFileScreen.passwordInput.setValue(password);
    await ImportKeystoreFileScreen.continueButton.click();

    // Give it a moment to process
    await browser.pause(2000);

    // Wait for the ChooseAccountsForm to appear after keystore is processed
    await browser.waitUntil(
      async () => {
        try {
          const element = await browser.$(
            "[class*='root@chooseItems'],[class*='root@chooseAccounts']",
          );
          const exists = await element.isExisting();
          if (!exists) {
            return false;
          }
          return await element.isDisplayed();
        } catch {
          return false;
        }
      },
      {
        timeout: 30000,
        timeoutMsg:
          'ChooseAccountsForm did not appear after importing keystore file.',
      },
    );

    await ChooseAccountsForm.importButton.click();
    await ImportSuccessScreen.addAnotherAccountButton.click();
  },
};
