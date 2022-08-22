import path from 'path';
import expect from 'expect';

import { BasePage, IterableConstant } from '../../pages/BasePage';
import { ExtensionInitPage } from '../../pages/ExtensionInitPage';
import { AccountPage } from '../../pages/AccountPage';
import { ClockUnit } from '../../../utils/clockUnit';
import { installAddOnHelper } from '../../../utils/installGeckoAddon';
import { copyDir } from '../../../utils/copyDir';
import {
  getChromeExtensionVersion,
  getOperaExtensionVersion,
  getEdgeExtensionVersion,
} from '../../../utils/grabExtensionVersion';
import { ResourcesProvider } from '../../../testData/res/ResourcesProvider';
import { DEFAULT_PASSWORD } from '../../../testData/res/constants';
import extensionVersion from '../../../../package.json';
import { DataGenerator } from '../../../utils/DataGenerator';
import { UserProvider } from '../../../testData/UserProvider';

const extensionInitPage = new ExtensionInitPage();
const basePage = new BasePage();
const accountPage = new AccountPage();
const clockUnit = new ClockUnit();
const resourcesProvider = new ResourcesProvider();
const dataGenerator = new DataGenerator();
const userProvider = new UserProvider();

const { I } = inject();

Given('I prepare Opera extension', async () => {
  const extId = await basePage.getItemFromLocalStorage('operaId');
  const popup = basePage.BROWSER_URLS.POPUP;
  const extensionWelcomePage = extId.concat(popup);
  await I.amOnPage(extensionWelcomePage);
  I.waitForElement(
    accountPage.SELECTORS.GET_STARTED_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.switchToNextTab(2);
});

Given('I prepare Firefox extension', async () => {
  await installAddOnHelper(
    path.join(__dirname, '..', '..', 'dist', 'keeper-wallet-2.9.0-firefox.xpi')
  );
  const extId = await basePage.getItemFromLocalStorage('firefoxId');
  const popup = basePage.BROWSER_URLS.POPUP;
  const extensionWelcomePage = extId.concat(popup);
  await I.amOnPage(extensionWelcomePage);
  I.waitForElement(
    accountPage.SELECTORS.GET_STARTED_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.closeCurrentTab();
});

Given(
  /^I on the '(POPUP|ACCOUNTS)' page for id '([^']+)'$/,
  async (pageType: string, browserId: string) => {
    const extId = await basePage.getItemFromLocalStorage(browserId);
    console.info(extId);
    const iterablePageUrls: IterableConstant = basePage.BROWSER_URLS;
    const targetPage = extId.concat(iterablePageUrls[pageType]);
    I.amOnPage(targetPage);
  }
);

Given(
  /^I on the '(CHROMIUM_EXTENSIONS|FIREFOX_EXTENSIONS|CHROME_SYSTEM)' page$/,
  (pageType: string) => {
    const iterablePageUrls: IterableConstant = basePage.BROWSER_URLS;
    I.amOnPage(iterablePageUrls[pageType]);
  }
);

When(/^I restart (?:Opera|Chrome) extension$/, () => {
  I.waitForElement(
    extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_RESTART_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.forceClick(
    extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_RESTART_BUTTON
  );
  I.wait(clockUnit.SECONDS * 2);
  I.forceClick(
    extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_RESTART_BUTTON
  );
  I.wait(clockUnit.SECONDS * 2);
  I.waitForElement(
    extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_ACTIVE,
    clockUnit.SECONDS * 30
  );
  I.seeElement(extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_ACTIVE);
});

When('I restart Edge extension', () => {
  I.waitForElement(
    basePage.BROWSER_SELECTORS.EDGE.SERVICE_WORKER_RESTART_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.waitForElement(
    extensionInitPage.SELECTORS.EDGE.WORKER_TITLE,
    clockUnit.SECONDS * 30
  );
  I.click(basePage.BROWSER_SELECTORS.EDGE.SERVICE_WORKER_RESTART_BUTTON);
  I.dontSeeElementInDOM(extensionInitPage.SELECTORS.EDGE.WORKER_TITLE);
  I.wait(clockUnit.SECONDS * 2); // debug wait
  I.click(basePage.BROWSER_SELECTORS.EDGE.SERVICE_WORKER_RESTART_BUTTON);
  I.waitForElement(
    extensionInitPage.SELECTORS.EDGE.SERVICE_WORKER_ACTIVE,
    clockUnit.SECONDS * 30
  );
  I.seeElementInDOM(extensionInitPage.SELECTORS.EDGE.WORKER_TITLE);
});

When('I click on the Get Started button', () => {
  I.waitForElement(
    accountPage.SELECTORS.GET_STARTED_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.GET_STARTED_BUTTON);
});

Then(
  /^The Get started button is '(available|not available)' in the modal page$/,
  async (availability: string) => {
    await basePage.checkElementAvailability(
      accountPage.SELECTORS.GET_STARTED_BUTTON,
      availability
    );
  }
);

When('I fill password fields', () => {
  I.waitForElement(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CREATE_PASSWORD,
    clockUnit.SECONDS * 30
  );
  I.fillField(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CREATE_PASSWORD,
    DEFAULT_PASSWORD
  );
  I.waitForElement(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONFIRM_PASSWORD
  );
  I.fillField(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONFIRM_PASSWORD,
    DEFAULT_PASSWORD
  );
});

When('I accept terms', () => {
  I.waitForElement(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.ACCEPT_TERMS_CHECKBOX,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.CREATE_PASSWORD_INPUT.ACCEPT_TERMS_CHECKBOX);
  I.waitForElement(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.ACCEPT_CONDITIONS,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.CREATE_PASSWORD_INPUT.ACCEPT_CONDITIONS);
});

When('I click on the Continue button', () => {
  I.waitForElement(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONTINUE_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONTINUE_BUTTON);
});

When('I click on the Update Chromium extension button', () => {
  I.waitForElement(
    basePage.BROWSER_SELECTORS.CHROMIUM.UPDATE_EXTENSION_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.forceClick(basePage.BROWSER_SELECTORS.CHROMIUM.UPDATE_EXTENSION_BUTTON);
});

When('I click on the Update Edge extension button', () => {
  I.waitForElement(
    basePage.BROWSER_SELECTORS.EDGE.UPDATE_EXTENSION_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.forceClick(basePage.BROWSER_SELECTORS.EDGE.UPDATE_EXTENSION_BUTTON);
});

When('I populate Embedded Seeds', () => {
  const stagenetSeed = resourcesProvider.getStageNetSeed();
  const testnetSeed = resourcesProvider.getTestNetSeed();
  const mainnetSeed = resourcesProvider.getMainNetSeed();
  const accountSeedNameStagenet = dataGenerator.accountName('STAGENET_SEED');
  const accountSeedNameTestnet = dataGenerator.accountName('TESTNET_SEED');
  const accountSeedNameMainnet = dataGenerator.accountName('MAINNET_SEED');

  // TODO: rewrite this madness with builders and implement services to prepare data objects
  const seeds = [stagenetSeed, testnetSeed, mainnetSeed];
  const network = ['Stagenet', 'Testnet', 'Mainnet'];
  const accountName = [
    accountSeedNameStagenet,
    accountSeedNameTestnet,
    accountSeedNameMainnet,
  ];

  for (let i = 0; i < seeds.length; i += 1) {
    I.waitForElement(
      accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON);
    I.waitForElement(
      accountPage.SELECTORS.NETWORK.NETWORK_TYPE(network[i]),
      clockUnit.SECONDS * 30
    );
    I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE(network[i]));
    I.waitForElement(
      accountPage.SELECTORS.SEED_ACCOUNTS.IMPORT_SEED,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.SEED_ACCOUNTS.IMPORT_SEED);
    I.waitForElement(
      accountPage.SELECTORS.SEED_ACCOUNTS.SEED_PHRASE_INPUT,
      clockUnit.SECONDS * 30
    );
    I.fillField(
      accountPage.SELECTORS.SEED_ACCOUNTS.SEED_PHRASE_INPUT,
      seeds[i].phrase as string
    );
    I.seeTextEquals(seeds[i].address, accountPage.SELECTORS.ACCOUNT_ADDRESS);
    I.waitForElement(
      accountPage.SELECTORS.CONTINUE_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
    I.waitForElement(
      accountPage.SELECTORS.ACCOUNT_NAME_INPUT,
      clockUnit.SECONDS * 30
    );
    I.fillField(accountPage.SELECTORS.ACCOUNT_NAME_INPUT, accountName[i]);
    I.waitForElement(
      accountPage.SELECTORS.CONTINUE_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
    I.waitForElement(
      accountPage.SELECTORS.ADD_ANOTHER_ACCOUNT,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.ADD_ANOTHER_ACCOUNT);
  }
});

When('I populate Embedded Emails', () => {
  const userTestnet = userProvider.getTestNetUser();
  const userMainnet = userProvider.getMainNetUser();

  const accountEmailNameTestnet = dataGenerator.accountName('TESTNET_EMAIL');
  const accountEmailNameMainnet = dataGenerator.accountName('MAINNET_EMAIL');

  // TODO: Forgive me God for this code but I didn't have time to think
  const emailUsers = [userMainnet, userTestnet];
  const network = ['Mainnet', 'Testnet'];
  const accountName = [accountEmailNameMainnet, accountEmailNameTestnet];

  for (let i = 0; i < emailUsers.length; i += 1) {
    I.waitForElement(
      accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON);
    I.waitForElement(
      accountPage.SELECTORS.NETWORK.NETWORK_TYPE(network[i]),
      clockUnit.SECONDS * 30
    );
    I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE(network[i]));
    I.waitForElement(
      accountPage.SELECTORS.EMAIL_ACCOUNTS.IMPORT_EMAIL,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.EMAIL_ACCOUNTS.IMPORT_EMAIL);
    I.waitForElement(
      accountPage.SELECTORS.EMAIL_ACCOUNTS.INPUT_ACCOUNT_EMAIL,
      clockUnit.SECONDS * 30
    );
    I.fillField(
      accountPage.SELECTORS.EMAIL_ACCOUNTS.INPUT_ACCOUNT_EMAIL,
      emailUsers[i].email
    );
    I.waitForElement(
      accountPage.SELECTORS.ACCOUNT_PASSWORD_INPUT,
      clockUnit.SECONDS * 30
    );
    I.fillField(
      accountPage.SELECTORS.ACCOUNT_PASSWORD_INPUT,
      emailUsers[i].password
    );
    I.waitForElement(
      accountPage.SELECTORS.SUBMIT_ACCOUNT_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.SUBMIT_ACCOUNT_BUTTON);
    I.waitForElement(
      accountPage.SELECTORS.ACCOUNT_NAME_INPUT,
      clockUnit.SECONDS * 30
    );
    I.fillField(accountPage.SELECTORS.ACCOUNT_NAME_INPUT, accountName[i]);
    I.waitForElement(
      accountPage.SELECTORS.CONTINUE_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
    I.waitForElement(
      accountPage.SELECTORS.ADD_ANOTHER_ACCOUNT,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.ADD_ANOTHER_ACCOUNT);
  }
});

When(
  /^I populate seed type '([^']+)' with prefix '([^']+)'$/,
  async (seedType: string, prefix: string) => {
    const customSeed = resourcesProvider.getCustomSeed(seedType);
    const accountSeedNameTestnet = dataGenerator.accountName(prefix);

    I.waitForElement(
      accountPage.SELECTORS.SEED_ACCOUNTS.IMPORT_SEED,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.SEED_ACCOUNTS.IMPORT_SEED);
    I.waitForElement(
      accountPage.SELECTORS.SEED_ACCOUNTS.SEED_PHRASE_INPUT,
      clockUnit.SECONDS * 30
    );
    I.fillField(
      accountPage.SELECTORS.SEED_ACCOUNTS.SEED_PHRASE_INPUT,
      customSeed.phrase as string
    );
    I.seeTextEquals(customSeed.address, accountPage.SELECTORS.ACCOUNT_ADDRESS);
    I.waitForElement(
      accountPage.SELECTORS.CONTINUE_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
    I.waitForElement(
      accountPage.SELECTORS.ACCOUNT_NAME_INPUT,
      clockUnit.SECONDS * 30
    );
    I.fillField(
      accountPage.SELECTORS.ACCOUNT_NAME_INPUT,
      accountSeedNameTestnet
    );
    I.waitForElement(
      accountPage.SELECTORS.CONTINUE_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
  }
);

When('I Click on the Enable Developer mode button in Edge', () => {
  I.waitForElement(
    basePage.BROWSER_SELECTORS.EDGE.DEV_MODE_TOGGLE,
    clockUnit.SECONDS * 30
  );
  I.click(basePage.BROWSER_SELECTORS.EDGE.DEV_MODE_TOGGLE);
});

When(
  /^I click on the Enable Developer mode button in (?:Chrome|Opera)$/,
  () => {
    I.waitForElement(
      basePage.BROWSER_SELECTORS.CHROMIUM.DEV_MODE_TOGGLE,
      clockUnit.SECONDS * 30
    );
    I.click(basePage.BROWSER_SELECTORS.CHROMIUM.DEV_MODE_TOGGLE);
  }
);

When(/^I click on the Extension details button in (?:Chrome|Opera)$/, () => {
  I.waitForElement(
    basePage.BROWSER_SELECTORS.CHROMIUM.DETAILS_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(basePage.BROWSER_SELECTORS.CHROMIUM.DETAILS_BUTTON);
});

When('I Click on the Extension details button in Edge', () => {
  I.waitForElement(
    basePage.BROWSER_SELECTORS.EDGE.DETAILS_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(basePage.BROWSER_SELECTORS.EDGE.DETAILS_BUTTON);
});

When(
  /^I initialize '([^']+)' folder and update extension on the latest version$/,
  async (dirType: string) => {
    const extDir = resourcesProvider.prepareUpdateDir(dirType);
    await copyDir(extDir);
    await I.wait(clockUnit.SECONDS * 5);
  }
);

When(
  /^I initialize '([^']+)' folder and update extension on the previous version$/,
  async (dirType: string) => {
    const extDir = await resourcesProvider.prepareInitDir(dirType);
    await copyDir(extDir);
  }
);

When(
  /^I grab and set (?:Chrome|Opera) extension id to local storage with tag '([^']+)'$/,
  async (idTag: string) => {
    I.waitForElement(
      extensionInitPage.SELECTORS.CHROMIUM.EXTENSION_ID,
      clockUnit.SECONDS * 30
    );
    const extId = await I.grabTextFrom(
      extensionInitPage.SELECTORS.CHROMIUM.EXTENSION_ID
    );
    await basePage.setItemToLocalStorage(idTag, extId);
  }
);

When(
  /^I grab and set Firefox extension id to local storage with tag '([^']+)'$/,
  async (idTag: string) => {
    I.waitForText(
      basePage.BROWSER_SELECTORS.FIREFOX.MANIFEST_EMAIL_TEXT,
      clockUnit.SECONDS * 30
    );
    I.waitForElement(extensionInitPage.SELECTORS.FIREFOX.EXTENSION_ID);
    const extId = await I.grabTextFrom(
      extensionInitPage.SELECTORS.FIREFOX.EXTENSION_ID
    );
    await basePage.setItemToLocalStorage(idTag, extId);
  }
);

When(
  /^I grab and set Edge extension id to local storage with tag '([^']+)'$/,
  async (idTag: string) => {
    I.waitForElement(
      extensionInitPage.SELECTORS.EDGE.EXTENSION_ID,
      clockUnit.SECONDS * 30
    );
    const extId = await I.grabTextFrom(
      extensionInitPage.SELECTORS.EDGE.EXTENSION_ID
    );
    await basePage.setItemToLocalStorage(idTag, extId);
  }
);

Then(
  /^I see Keeper version in Opera is '(equal|not equal)' to latest$/,
  async (versionEquality: string) => {
    const extVersion = extensionVersion.version;
    const browserVersion = await getOperaExtensionVersion();
    if (versionEquality === 'equal') {
      expect(extVersion).toEqual(browserVersion);
    } else {
      expect(extVersion).not.toEqual(browserVersion);
    }
  }
);

Then(
  /^I see Keeper version in Chrome is '(equal|not equal)' to latest$/,
  async (versionEquality: string) => {
    const extVersion = extensionVersion.version;
    const browserVersion = await getChromeExtensionVersion();
    if (versionEquality === 'equal') {
      expect(extVersion).toEqual(browserVersion);
    } else {
      expect(extVersion).not.toEqual(browserVersion);
    }
  }
);

Then(
  /^I see Keeper version in Edge is '(equal|not equal)' to latest$/,
  async (versionEquality: string) => {
    const extVersion = extensionVersion.version;
    const browserVersion = await getEdgeExtensionVersion();
    if (versionEquality === 'equal') {
      expect(extVersion).toEqual(browserVersion);
    } else {
      expect(extVersion).not.toEqual(browserVersion);
    }
  }
);
