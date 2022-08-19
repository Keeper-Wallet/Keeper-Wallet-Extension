import { BasePage } from '../tests/pages/BasePage';
import { ExtensionInitPage } from '../tests/pages/ExtensionInitPage';
import { Locator } from '../interfaces/Locator.interface';
import { AccountPage } from '../tests/pages/AccountPage';
import { ClockUnit } from './clockUnit';
import { DEFAULT_PASSWORD } from '../testData/res/constants';

const extensionInitPage = new ExtensionInitPage();
const basePage = new BasePage();
const accountPage = new AccountPage();
const clockUnit = new ClockUnit();

const { I } = inject();
const args = process.env.BROWSER_INIT_NAME;

export class ExtensionInitHandler {
  initAccountScreen = async (): Promise<void> => {
    I.waitForElement(
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
      DEFAULT_PASSWORD
    );
    I.waitForElement(
      accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONFIRM_PASSWORD
    );
    I.fillField(
      accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONFIRM_PASSWORD,
      DEFAULT_PASSWORD
    );
    I.click(accountPage.SELECTORS.CREATE_PASSWORD_INPUT.ACCEPT_TERMS_CHECKBOX);
    I.click(accountPage.SELECTORS.CREATE_PASSWORD_INPUT.ACCEPT_CONDITIONS);
    I.click(accountPage.SELECTORS.CREATE_PASSWORD_INPUT.CONTINUE_BUTTON);
  };

  restartServiceWorker = async (): Promise<void> => {
    const detailsButtonSelector: Locator =
      basePage.BROWSER_SELECTORS.CHROMIUM.DETAILS_BUTTON;
    const restartWorkerButton: Locator =
      extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_RESTART_BUTTON;
    const edgeRestartWorkerButton: Locator =
      basePage.BROWSER_SELECTORS.EDGE.SERVICE_WORKER_RESTART_BUTTON;
    const workerActiveStatus: Locator =
      extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_ACTIVE;
    const workerInactiveStatus: Locator =
      extensionInitPage.SELECTORS.CHROMIUM.SERVICE_WORKER_INACTIVE;
    const edgeWorkerActiveStatus: Locator =
      extensionInitPage.SELECTORS.EDGE.SERVICE_WORKER_ACTIVE;
    const edgeWorkerTitle: Locator =
      extensionInitPage.SELECTORS.EDGE.WORKER_TITLE;

    switch (args) {
      case 'MicrosoftEdge': {
        I.waitForElement(edgeRestartWorkerButton, clockUnit.SECONDS * 30);
        I.waitForElement(edgeWorkerTitle, clockUnit.SECONDS * 30);
        I.click(edgeRestartWorkerButton);
        I.dontSeeElementInDOM(edgeWorkerTitle);
        I.wait(clockUnit.SECONDS * 2); // debug wait
        I.click(edgeRestartWorkerButton);
        I.waitForElement(edgeWorkerActiveStatus, clockUnit.SECONDS * 30);
        I.seeElementInDOM(edgeWorkerTitle);
        break;
      }
      default: {
        I.waitForElement(detailsButtonSelector, clockUnit.SECONDS * 30);
        I.click(detailsButtonSelector);
        I.waitForElement(restartWorkerButton, clockUnit.SECONDS * 30);
        I.click(restartWorkerButton);
        I.waitForElement(workerInactiveStatus, clockUnit.SECONDS * 30);
        I.seeTextEquals('No active views', workerInactiveStatus);
        I.click(restartWorkerButton);
        I.waitForElement(workerActiveStatus, clockUnit.SECONDS * 30);
        I.seeElement(workerActiveStatus);
        break;
      }
    }
  };
}
