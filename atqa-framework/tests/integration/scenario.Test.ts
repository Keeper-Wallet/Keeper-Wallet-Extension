import { ClockUnit } from '../../utils/clockUnit';
// import { BasePage } from '../pages/BasePage';
import { ExtensionInitHandler } from '../../utils/ExtensionInitHandler';
import { AccountPage } from '../pages/AccountPage';
import { ResourcesProvider } from '../../testData/res/ResourcesProvider';
import { copyDir } from '../../utils/copyDirHandler';

// const basePage = new BasePage();
const clockUnit = new ClockUnit();
const extensionInitHandler = new ExtensionInitHandler();
const accountPage = new AccountPage();
const resourcesProvider = new ResourcesProvider();

const { I } = inject();

Feature('Initial Test');

Background(async () => {
  return extensionInitHandler.extensionInit();
});

Scenario('Init scenario', async () => {
  //I.wait(clockUnit.MINUTES * 30);
  I.waitForEnabled(
    accountPage.SELECTORS.GET_STARTED_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.GET_STARTED_BUTTON);
  I.waitForElement(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CREATE_PASSWORD,
    clockUnit.SECONDS * 30
  );
  I.fillField(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CREATE_PASSWORD,
    '12345678'
  );
  I.waitForElement(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONFIRM_PASSWORD
  );
  I.fillField(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONFIRM_PASSWORD,
    '12345678'
  );
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
  I.waitForElement(
    accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONTINUE_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONTINUE_BUTTON);
  // I.waitForElement(
  //   accountPage.SELECTORS.ACCOUNTS.ADD_ACCOUNT_BUTTON,
  //   clockUnit.SECONDS * 30
  // );
  // I.click(accountPage.SELECTORS.ACCOUNTS.ADD_ACCOUNT_BUTTON);
  I.waitForElement(
    accountPage.SELECTORS.ACCOUNTS.ADD_KEYSTORE_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.ACCOUNTS.ADD_KEYSTORE_BUTTON);
  I.waitForElement(
    accountPage.SELECTORS.ACCOUNTS.KEYSTORE_FILE_INPUT,
    clockUnit.SECONDS * 30
  );
  I.attachFile(
    accountPage.SELECTORS.ACCOUNTS.KEYSTORE_FILE_INPUT,
    '/testData/res/data/keystore-wkeeper-2206221602.json'
  );
  I.wait(clockUnit.MINUTES * 2);
});

Scenario('debugScenario @debug', async () => {
  const updateChrome = await resourcesProvider.prepareUpdateDir('chrome_dir_update');
  copyDir(updateChrome);
  // I.wait(clockUnit.MINUTES * 2);
});
