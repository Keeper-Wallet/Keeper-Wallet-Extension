import { ClockUnit } from '../../utils/clockUnit';
import { ExtensionInitHandler } from '../../utils/ExtensionInitHandler';
import { AccountPage } from '../pages/AccountPage';

const clockUnit = new ClockUnit();
const extensionInitHandler = new ExtensionInitHandler();
const accountPage = new AccountPage();

const { I } = inject();

Feature('Initial Test');

Background(async () => {
  return extensionInitHandler.extensionInit();
});

Scenario('Debug scenario', async () => {
  //I.wait(clockUnit.MINUTES * 30);
  I.waitForEnabled(
    accountPage.SELECTORS.GET_STARTED_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.doubleClick(accountPage.SELECTORS.GET_STARTED_BUTTON);
  I.wait(clockUnit.SECONDS * 10);
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
  I.waitForElement(
    accountPage.SELECTORS.ACCOUNTS.ADD_ACCOUNT_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.ACCOUNTS.ADD_ACCOUNT_BUTTON);
  I.waitForElement(
    accountPage.SELECTORS.ACCOUNTS.ADD_KEYSTORE_BUTTON,
    clockUnit.SECONDS * 30
  );
  I.click(accountPage.SELECTORS.ACCOUNTS.ADD_KEYSTORE_BUTTON);
  I.wait(clockUnit.MINUTES * 2);
});
