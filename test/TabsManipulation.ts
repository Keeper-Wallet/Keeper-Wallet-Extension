import waitForExpect from 'wait-for-expect';

import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { GetStartedScreen } from './helpers/GetStartedScreen';
import { ImportFormScreen } from './helpers/ImportFormScreen';
import { ImportSuccessScreen } from './helpers/ImportSuccessScreen';
import { ImportViaSeedScreen } from './helpers/ImportViaSeedScreen';
import { NewAccountScreen } from './helpers/NewAccountScreen';
import { NewWalletNameScreen } from './helpers/NewWalletNameScreen';
import { App, PopupHome, Windows } from './utils/actions';
import { DEFAULT_PASSWORD } from './utils/constants';

describe('Tabs manipulation', function () {
  let tabKeeper: string, tabAccounts: string;

  after(async () => {
    await browser.openKeeperPopup();
    await App.resetVault();
  });

  describe('vault is empty', function () {
    after(async function () {
      await App.closeBgTabs(tabKeeper);
    });

    it('new "accounts" appears when opened "popup"', async function () {
      tabKeeper = await browser.getWindowHandle();
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.openKeeperPopup();

      [tabAccounts] = await waitForNewWindows(1);
      await browser.switchToWindow(tabAccounts);
      await browser.refresh();
    });

    it('no more tabs appears when opened "popup" again', async function () {
      await browser.switchToWindow(tabKeeper);
      await browser.refresh();
    });

    it('import form appears in "accounts" after password entered', async function () {
      await browser.switchToWindow(tabAccounts);
      await browser.refresh();

      await GetStartedScreen.getStartedButton.click();
      expect(await NewAccountScreen.root).toBeDisplayed();
      await NewAccountScreen.passwordInput.setValue(DEFAULT_PASSWORD);
      await NewAccountScreen.passwordConfirmationInput.setValue(
        DEFAULT_PASSWORD
      );
      await NewAccountScreen.privacyPolicyLine.click();
      await NewAccountScreen.termsAndConditionsLine.click();
      await NewAccountScreen.continueButton.click();

      expect(await EmptyHomeScreen.root).toBeDisplayed();
    });
  });

  describe('vault initialized', function () {
    after(async function () {
      await App.closeBgTabs(tabKeeper);
    });

    it('"add account" button appears in "popup" when password entered', async function () {
      expect(await EmptyHomeScreen.addButton).toBeDisplayed();
    });

    it('new "accounts" appears when click "add account" button in "popup"', async function () {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      tabKeeper = await browser.getWindowHandle();
      await EmptyHomeScreen.addButton.click();
      [tabAccounts] = await waitForNewWindows(1);

      await browser.switchToWindow(tabAccounts);
      await browser.refresh();
    });

    it('no more tabs appears when click "add account" button in "popup" again', async function () {
      await browser.switchToWindow(tabKeeper);
      await browser.refresh();

      expect(await browser.getWindowHandles()).toHaveLength(2);
    });

    async function importAccountUntilSuccess(name: string, seed: string) {
      await ImportFormScreen.importViaSeedButton.click();
      await ImportViaSeedScreen.seedInput.setValue(seed);
      await ImportViaSeedScreen.importAccountButton.click();

      await NewWalletNameScreen.nameInput.setValue(name);
      await NewWalletNameScreen.continueButton.click();
    }

    it('success form displayed when import is done', async function () {
      await browser.switchToWindow(tabAccounts);
      await browser.refresh();

      await importAccountUntilSuccess(
        'rich',
        'waves private node seed with waves tokens'
      );

      expect(await ImportSuccessScreen.root).toBeDisplayed();
    });

    it('import form displays after "add another account" button click', async function () {
      await ImportSuccessScreen.addAnotherAccountButton.click();
      expect(await ImportFormScreen.root).toBeDisplayed();
    });

    it('"finish" button closes "accounts" tab', async function () {
      await importAccountUntilSuccess(
        'poor',
        'waves private node seed without waves tokens'
      );

      await ImportSuccessScreen.finishButton.click();
      await waitForExpect(async () => {
        expect(await browser.getWindowHandles()).toHaveLength(1);
      });
    });

    it('"accounts" appears when add another account from "popup"', async function () {
      await browser.switchToWindow(tabKeeper);

      await PopupHome.addAccount();

      await waitForExpect(async () => {
        expect(await browser.getWindowHandles()).toHaveLength(2);
      });
    });

    it('no more tabs appears when add another account from "popup" again', async function () {
      await browser.switchToWindow(tabKeeper);

      await PopupHome.addAccount();

      await waitForExpect(async () => {
        expect(await browser.getWindowHandles()).toHaveLength(2);
      });
    });
  });
});
