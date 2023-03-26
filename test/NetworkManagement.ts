import waitForExpect from 'wait-for-expect';

import { AccountInfoScreen } from './helpers/AccountInfoScreen';
import { CustomNetworkModal } from './helpers/CustomNetworkModal';
import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { Network } from './helpers/flows/Network';
import { HomeScreen } from './helpers/HomeScreen';
import { NetworksMenu } from './helpers/NetworksMenu';
import { TopMenu } from './helpers/TopMenu';
import { Windows } from './helpers/Windows';

describe('Network management', function () {
  let tabKeeper: string;

  before(async () => {
    await App.initVault();
  });

  after(async function () {
    await Network.switchToAndCheck('Mainnet');
    await App.closeBgTabs(tabKeeper);
    await App.resetVault();
  });

  describe('Switching networks', function () {
    it('Stagenet', async () => {
      await Network.switchToAndCheck('Stagenet');
    });

    it('Mainnet', async () => {
      await Network.switchToAndCheck('Mainnet');
    });

    describe('Testnet', function () {
      it('Successfully switched', async () => {
        await Network.switchToAndCheck('Testnet');
      });

      it('Imported testnet account starts with 3N or 3M', async function () {
        tabKeeper = await browser.getWindowHandle();

        const { waitForNewWindows } = await Windows.captureNewWindows();
        await EmptyHomeScreen.addButton.click();
        const [tabAccounts] = await waitForNewWindows(1);

        await browser.switchToWindow(tabAccounts);
        await browser.refresh();

        await AccountsHome.importAccount(
          'rich',
          'waves private node seed with waves tokens'
        );
        await browser.switchToWindow(tabKeeper);

        await HomeScreen.activeAccountCard.click();
        expect(await AccountInfoScreen.address.getText()).toMatch(/^3[MN]/i);

        await TopMenu.backButton.click();

        await expect(HomeScreen.root).toBeDisplayed();
      });
    });

    describe('Custom', function () {
      const invalidNodeUrl = 'https://nodes.invalid.com';
      const customNetwork = 'Custom';

      it('Successfully switched', async function () {
        await Network.switchTo(customNetwork);

        await CustomNetworkModal.addressInput.setValue(this.nodeUrl);
        await CustomNetworkModal.saveButton.click();

        await Network.checkNetwork(customNetwork);
      });

      describe('Changing network settings by "Edit" button', function () {
        before(async function () {
          await NetworksMenu.editButton.click();
          await expect(CustomNetworkModal.root).toBeDisplayed();
        });

        beforeEach(async function () {
          await CustomNetworkModal.addressInput.clearValue();
          await CustomNetworkModal.matcherAddressInput.clearValue();
        });

        it('Node address is required field', async function () {
          await CustomNetworkModal.saveButton.click();
          await expect(CustomNetworkModal.addressError).toHaveText(
            'URL is required'
          );
        });

        it('The address of non-existed node was entered', async function () {
          await CustomNetworkModal.addressInput.setValue(invalidNodeUrl);
          await CustomNetworkModal.saveButton.click();

          await waitForExpect(async () => {
            await expect(CustomNetworkModal.addressError).toHaveText(
              'Incorrect node address'
            );
          });
        });

        it('Matcher address is not required field', async function () {
          await CustomNetworkModal.addressInput.setValue(this.nodeUrl);
          await CustomNetworkModal.saveButton.click();

          await expect(NetworksMenu.editButton).toBeDisplayed();
        });
      });
    });
  });
});
