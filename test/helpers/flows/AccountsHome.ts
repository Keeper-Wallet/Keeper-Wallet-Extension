import { ImportFormScreen } from '../ImportFormScreen';
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
};
