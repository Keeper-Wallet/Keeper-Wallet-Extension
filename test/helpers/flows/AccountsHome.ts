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
    await ChooseAccountsForm.importButton.click();
    await ImportSuccessScreen.addAnotherAccountButton.click();
  },
};
