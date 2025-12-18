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
    // Using browser.$ to avoid implicit waits that throw errors
    await browser.waitUntil(
      async () => {
        try {
          const element = await browser.$(
            "[class*='root@chooseItems'],[class*='root@chooseAccounts']",
          );
          const exists = await element.isExisting();
          if (!exists) {
            // Debug: log what's on the page including any error messages
            const bodyText = await browser.execute(
              () => document.body.innerText,
            );
            const errorElements = await browser.$$('[class*="error"]');
            const errors = await Promise.all(
              errorElements.map(async el => {
                const text = await el.getText();
                return text;
              }),
            );
            console.log(
              'Page content while waiting:',
              bodyText.substring(0, 300),
            );
            if (errors.length > 0) {
              console.log('Error messages found:', errors);
            }
            return false;
          }
          return await element.isDisplayed();
        } catch (error) {
          // Debug: log the error
          console.log('Error finding ChooseAccountsForm:', error.message);
          return false;
        }
      },
      {
        timeout: 30000,
        timeoutMsg:
          'ChooseAccountsForm did not appear after importing keystore file. Check console logs for page content.',
      },
    );
    
    await ChooseAccountsForm.importButton.click();
    await ImportSuccessScreen.addAnotherAccountButton.click();
  },
};
