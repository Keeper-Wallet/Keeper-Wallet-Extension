import { BasePage } from '../../pages/BasePage';
import { AccountPage } from '../../pages/AccountPage';
import { ClockUnit } from '../../../utils/clockUnit';
import { ResourcesProvider } from '../../../testData/res/ResourcesProvider';
import { ModalPage } from '../../pages/ModalPage';
import { AssetPage } from '../../pages/AssetPage';
import extensionVersion from '../../../../package.json';
import { DEFAULT_PASSWORD } from '../../../testData/res/constants';
import { Locator } from '../../../interfaces/Locator.interface';

const basePage = new BasePage();
const accountPage = new AccountPage();
const clockUnit = new ClockUnit();
const resourcesProvider = new ResourcesProvider();
const modalPage = new ModalPage();
const assetPage = new AssetPage();

const { I } = inject();

When(
  /^I choose '(Mainnet|Testnet|Stagenet)' network$/,
  (networkType: string) => {
    I.waitForElement(
      accountPage.SELECTORS.NETWORK.NETWORK_TYPE(networkType),
      clockUnit.SECONDS * 30
    );
    I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE(networkType));
  }
);

When(/^I click on the '(NFTs|Assets|History)' tab$/, (tab: string) => {
  I.waitForElement(modalPage.SELECTORS.KEEPER_TAB(tab), clockUnit.SECONDS * 30);
  I.click(modalPage.SELECTORS.KEEPER_TAB(tab));
});

When('I click on the Choose network button', () => {
  I.waitForElement(
    accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON);
});

When('I click on the More button', () => {
  I.waitForElement(
    assetPage.SELECTORS.WAVES_MORE_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.moveCursorTo(assetPage.SELECTORS.WAVES_MORE_BUTTON);
});

When('I click on the Send asset button', () => {
  I.waitForElement(assetPage.SELECTORS.SEND_BUTTON, clockUnit.SECONDS * 30);
  I.click(assetPage.SELECTORS.SEND_BUTTON);
});

When('I click on Back Settings button', () => {
  I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.ARROW_BACK_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.SETTINGS_MENU.ARROW_BACK_BUTTON);
});

When('I click on Close Settings button', () => {
  I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.CLOSE_SETTING_MENU,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.SETTINGS_MENU.CLOSE_SETTING_MENU);
});

When('I click on the Settings button', () => {
  I.waitForElement(modalPage.SELECTORS.SETTINGS_BUTTON, clockUnit.SECONDS * 30);
  I.click(modalPage.SELECTORS.SETTINGS_BUTTON);
});

When('I click on the General Settings button', () => {
  I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.GENERAL_SETTINGS,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.SETTINGS_MENU.GENERAL_SETTINGS);
});

When('I fill default password', () => {
  I.waitForElement(
    modalPage.SELECTORS.KEEPER_PASSWORD_INPUT,
    clockUnit.SECONDS * 30
  );
  I.fillField(modalPage.SELECTORS.KEEPER_PASSWORD_INPUT, DEFAULT_PASSWORD);
});

When('I submit default password', () => {
  I.waitForElement(
    modalPage.SELECTORS.SUBMIT_KEEPER_PASSWORD,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.SUBMIT_KEEPER_PASSWORD);
});

When(/^I set Keeper timeout for '([^']+)'$/, (timeoutDuration: string) => {
  I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.OPEN_TIMEOUT_MENU,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.SETTINGS_MENU.OPEN_TIMEOUT_MENU);
  I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.SET_TIMEOUT(timeoutDuration),
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.SETTINGS_MENU.SET_TIMEOUT(timeoutDuration));
});

When(/^I fill amount '(\d+)' for Embedded Stagenet seed$/, (amount: number) => {
  I.waitForElement(
    modalPage.SELECTORS.TRANSACTION_MODAL.RECIPIENT_AMOUNT_FIELD,
    clockUnit.SECONDS * 30
  );
  const seedUser = resourcesProvider.getStageNetSeed();
  I.fillField(
    modalPage.SELECTORS.TRANSACTION_MODAL.RECIPIENT_AMOUNT_FIELD,
    seedUser.address
  );
  I.waitForElement(
    modalPage.SELECTORS.TRANSACTION_MODAL.AMOUNT_INPUT,
    clockUnit.SECONDS * 30
  );
  I.fillField(modalPage.SELECTORS.TRANSACTION_MODAL.AMOUNT_INPUT, amount);
});

When('I click on the LogOut button', () => {
  I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.LOG_OUT_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.SETTINGS_MENU.LOG_OUT_BUTTON);
});

When('I close current tab', () => {
  I.closeCurrentTab();
});

When(/^I switch to tab on position '(\d+)'$/, (tabIndex: number) => {
  I.switchToNextTab(tabIndex);
});

When('I click on the Transfer amount button', () => {
  I.waitForElement(
    modalPage.SELECTORS.TRANSACTION_MODAL.SUBMIT_TRANSFER_AMOUNT,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.TRANSACTION_MODAL.SUBMIT_TRANSFER_AMOUNT);
});

When('I click on the Reject transaction button', () => {
  I.waitForElement(
    modalPage.SELECTORS.TRANSACTION_MODAL.REJECT_TRANSACTION,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.TRANSACTION_MODAL.REJECT_TRANSACTION);
});

When('I close Transaction modal window', () => {
  I.waitForElement(
    modalPage.SELECTORS.TRANSACTION_MODAL.CLOSE_TRANSACTION_WINDOW,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.TRANSACTION_MODAL.CLOSE_TRANSACTION_WINDOW);
});

Then('I click on the Choose Account button', () => {
  I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON);
});

Then(/^I choose account at position '(\d+)'$/, (index: number) => {
  I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(index),
    clockUnit.SECONDS * 30
  );
  I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(index));
});

Then(
  /^The account '([^']+)' is '(not available|available)' on the asset tab$/,
  async (accountType: string, availability: string) => {
    await basePage.checkElementAvailability(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE(accountType),
      availability
    );
  }
);

Then(
  /^The amount is equal to '(\d+)' and '(not available|available)' on the transfer modal page$/,
  async (amount: number, availability: string) => {
    await basePage.checkElementAvailability(
      modalPage.SELECTORS.TRANSACTION_MODAL.AMOUNT_VALUE(amount),
      availability
    );
  }
);

Then(
  /^The WAVES amount is equal to '(\d+)' and '(not available|available)' on the asset page$/,
  async (amount: number, availability: string) => {
    await basePage.checkElementAvailability(
      assetPage.SELECTORS.WAVES_AMOUNT(amount),
      availability
    );
  }
);

Then(
  /^I see WAVES asset is '(available|not available)' on the asset page$/,
  async (availability: string) => {
    await basePage.checkElementAvailability(
      assetPage.SELECTORS.WAVES_ASSET,
      availability
    );
  }
);

Then(/^I see '([^"]+)' message$/, (message: string) => {
  I.waitForText(message, clockUnit.SECONDS * 30);
  I.see(message);
});

Then(
  /^The assets of embedded Mainnet seed is '(available|not available)' on the Assets tab$/,
  async (availability: string) => {
    const btcAsset: Locator =
      assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.BTC_ASSET;
    const crvAsset: Locator =
      assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.CRV_ASSET;
    const eggAsset: Locator =
      assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.EGG_ASSET;
    const ethAsset: Locator =
      assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.ETH_ASSET;

    const arr = [btcAsset, crvAsset, eggAsset, ethAsset];

    for await (const value of arr) {
      await basePage.checkElementAvailability(value, availability);
    }
  }
);

Then(
  /^The assets of embedded Testnet email is '(available|not available)' on the Assets tab$/,
  async (availability: string) => {
    const assetOne: Locator =
      assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.ASSET_EMAIL_1;
    const assetTwo: Locator =
      assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.ASSET_EMAIL_2;

    const arr = [assetOne, assetTwo];

    for await (const value of arr) {
      await basePage.checkElementAvailability(value, availability);
    }
  }
);

Then(
  /^The NFTs for Embedded Testnet Email is '(available|not available)' on the NFT tab$/,
  async (availability: string) => {
    await basePage.checkElementAvailability(
      assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.NFT_ASSETS.NFT_GROUP,
      availability
    );
  }
);

Then(
  /^The assets of embedded Testnet seed is '(available|not available)' on the Assets tab$/,
  async (availability: string) => {
    const assetOne: Locator =
      assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_1;
    const assetTwo: Locator =
      assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_2;
    const assetThree: Locator =
      assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_3;
    const assetFour: Locator =
      assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_4;
    const assetFive: Locator =
      assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_5;

    const arr = [assetOne, assetTwo, assetThree, assetFour, assetFive];

    for await (const value of arr) {
      await basePage.checkElementAvailability(value, availability);
    }
  }
);

Then(
  /^The latest Keeper version '(available|not available)' in the modal page$/,
  async (availability: string) => {
    const extVersion = extensionVersion.version;
    await basePage.checkElementAvailability(
      modalPage.SELECTORS.KEEPER_CURRENT_VERSION(extVersion),
      availability
    );
  }
);

Then(
  /^The Finish button is '(available|not available)' on the Import page$/,
  async (availability: string) => {
    await basePage.checkElementAvailability(
      accountPage.SELECTORS.FINISH_ACCOUNT_CREATION,
      availability
    );
  }
);

Then(
  /^The assets of embedded Stagenet seed is '(available|not available)' on the Assets tab$/,
  async (availability: string) => {
    const assetOne: Locator =
      assetPage.SELECTORS.STAGENET_SEED_ACCOUNT.ASSET_STG_1;
    const assetTwo: Locator =
      assetPage.SELECTORS.STAGENET_SEED_ACCOUNT.ASSET_STG_2;
    const assetThree: Locator =
      assetPage.SELECTORS.STAGENET_SEED_ACCOUNT.ASSET_STG_3;

    const arr = [assetOne, assetTwo, assetThree];

    for await (const value of arr) {
      await basePage.checkElementAvailability(value, availability);
    }
  }
);

Then(
  /^The NFTs group is '(available|not available)' on the NFT tab$/,
  async (availability: string) => {
    await basePage.checkElementAvailability(
      assetPage.SELECTORS.NFT_GROUP,
      availability
    );
  }
);
