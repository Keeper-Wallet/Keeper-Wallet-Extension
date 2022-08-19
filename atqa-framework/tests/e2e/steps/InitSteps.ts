import path from 'path';

import { BasePage, IterableConstant } from '../../pages/BasePage';
import { ExtensionInitPage } from '../../pages/ExtensionInitPage';
import { AccountPage } from '../../pages/AccountPage';
import { ClockUnit } from '../../../utils/clockUnit';
import { installAddOnHelper } from '../../../utils/installGeckoAddon';
import { copyDir } from '../../../utils/copyDir';
import { AccountSeeder } from '../../../utils/AccountSeeder';
import { ResourcesProvider } from '../../../testData/res/ResourcesProvider';
import { DEFAULT_PASSWORD } from '../../../testData/res/constants';
import extensionVersion from '../../../../package.json';
import { DataGenerator } from '../../../utils/DataGenerator';

const extensionInitPage = new ExtensionInitPage();
const basePage = new BasePage();
const accountPage = new AccountPage();
const clockUnit = new ClockUnit();
const accountSeeder = new AccountSeeder();
const resourcesProvider = new ResourcesProvider();
const dataGenerator = new DataGenerator();

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

Given('I prepare Chrome extension', async () => {
  const extId = await basePage.getItemFromLocalStorage('chromeId');
  const popup = basePage.BROWSER_URLS.POPUP;
  const extensionWelcomePage = extId.concat(popup);
  await I.amOnPage(extensionWelcomePage);
  I.waitForElement(
    accountPage.SELECTORS.GET_STARTED_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.closeCurrentTab();
});

Given('I prepare Edge extension', async () => {
  const extId = await basePage.getItemFromLocalStorage('edgeId');
  const popup = basePage.BROWSER_URLS.POPUP;
  const extensionWelcomePage = extId.concat(popup);
  await I.amOnPage(extensionWelcomePage);
  I.waitForElement(
    accountPage.SELECTORS.GET_STARTED_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.closeCurrentTab();
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
    const iterablePageUrls: IterableConstant = basePage.BROWSER_URLS;
    const targetPage = extId.concat(iterablePageUrls[pageType]);
    I.amOnPage(targetPage);
  }
);

Given(
  /^I on the '(CHROMIUM_EXTENSIONS|FIREFOX_EXTENSIONS|CHROME_SYSTEM)' page$/,
  async (pageType: string) => {
    const iterablePageUrls: IterableConstant = basePage.BROWSER_URLS;
    await I.amOnPage(iterablePageUrls[pageType]);
  }
);

When(/^I restart (?:Opera|Chrome) extension$/, () => {
  I.waitForElement(
    basePage.BROWSER_SELECTORS.CHROMIUM.DETAILS_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(basePage.BROWSER_SELECTORS.CHROMIUM.DETAILS_BUTTON);
  I.waitForElement(
    extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_RESTART_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_RESTART_BUTTON);
  I.waitForElement(
    extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_INACTIVE,
    clockUnit.SECONDS * 30
  );
  I.seeTextEquals(
    'No active views',
    extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_INACTIVE
  );
  I.click(extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_RESTART_BUTTON);
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

When('I populate Embedded Seeds', async () => {
  await accountSeeder.populateEmbeddedSeed();
});

When('I populate Embedded Emails', async () => {
  await accountSeeder.populateEmbeddedEmail();
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
  /^I Click on the Enable Developer mode button in (?:Chrome|Opera)$/,
  () => {
    I.waitForElement(
      basePage.BROWSER_SELECTORS.CHROMIUM.DEV_MODE_TOGGLE,
      clockUnit.SECONDS * 30
    );
    I.click(basePage.BROWSER_SELECTORS.CHROMIUM.DEV_MODE_TOGGLE);
  }
);

When(/^I Click on the Extension details button in (?:Chrome|Opera)$/, () => {
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
    await console.info('Prepare for update');
    const extDir = await resourcesProvider.prepareUpdateDir(dirType);
    await copyDir(extDir);
  }
);

When(
  /^I initialize '([^']+)' folder and update extension on the previous version$/,
  async (dirType: string) => {
    const extDir = await resourcesProvider.prepareInitDir(dirType);
    await copyDir(extDir);
    await I.wait(clockUnit.SECONDS * 5);
    // TODO: find the way how to check that files has been indexed in filesystem
  }
);

When(
  /^I grab and set '(?:Chrome|Opera)' extension id to local storage with tag '([^']+)'$/,
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

Then(/^I see Keeper version in Opera is equal to latest$/, () => {
  const extVersion = extensionVersion.version;
  I.waitForElement(
    extensionInitPage.SELECTORS.OPERA.EXTENSION_VERSION,
    clockUnit.SECONDS * 30
  );
  I.seeTextEquals(
    extVersion,
    extensionInitPage.SELECTORS.OPERA.EXTENSION_VERSION
  );
});

Then(/^I see Keeper version in Chrome is equal to latest$/, () => {
  const extVersion = extensionVersion.version;
  I.waitForElement(
    extensionInitPage.SELECTORS.CHROMIUM.EXTENSION_VERSION,
    clockUnit.SECONDS * 30
  );
  I.seeTextEquals(
    extVersion,
    extensionInitPage.SELECTORS.CHROMIUM.EXTENSION_VERSION
  );
});

Then(/^I see Keeper version in Edge is equal to latest$/, () => {
  const extVersion = extensionVersion.version;
  I.waitForElement(
    extensionInitPage.SELECTORS.EDGE.EXTENSION_VERSION,
    clockUnit.SECONDS * 30
  );
  I.seeTextEquals(
    extVersion,
    extensionInitPage.SELECTORS.EDGE.EXTENSION_VERSION
  );
});
