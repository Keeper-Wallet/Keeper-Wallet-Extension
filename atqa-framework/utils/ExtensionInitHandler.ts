import fs from 'fs-extra';
import path from 'path';

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
  // TODO: get the file through the resource provider
  public installAddOnHelper = async (path: string): Promise<void> => {
    I.useWebDriverTo('Install Gecko AddOn', async ({ browser }) => {
      const extension = await fs.readFile(path);
      browser.installAddOn(extension.toString('base64'), true);
    });
  };

  public extensionInit = async (): Promise<void> => {
    const chromiumExtensionId: Locator =
      extensionInitPage.SELECTORS.CHROMIUM.EXTENSION_ID;
    const edgeExtensionId: Locator =
      extensionInitPage.SELECTORS.EDGE.EXTENSION_ID;
    const firefoxExtensionId: Locator =
      extensionInitPage.SELECTORS.FIREFOX.EXTENSION_ID;
    switch (args) {
      case 'chrome': {
        const extId = await basePage.getExtensionId(chromiumExtensionId);
        I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_HTML);
        I.waitForElement(
          accountPage.SELECTORS.GET_STARTED_BUTTON,
          clockUnit.SECONDS * 30
        );
        I.closeCurrentTab();
        await basePage.setItemToLocalStorage('chromeId', extId);
        break;
      }
      case 'opera': {
        const extId = await basePage.getExtensionId(chromiumExtensionId);
        I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_HTML);
        I.waitForElement(
          accountPage.SELECTORS.GET_STARTED_BUTTON,
          clockUnit.SECONDS * 30
        );
        I.switchToNextTab(2);
        await basePage.setItemToLocalStorage('operaId', extId);
        break;
      }
      case 'MicrosoftEdge': {
        const extId = await basePage.getExtensionId(edgeExtensionId);
        I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_HTML);
        I.waitForElement(
          accountPage.SELECTORS.GET_STARTED_BUTTON,
          clockUnit.SECONDS * 30
        );
        I.closeCurrentTab();
        await basePage.setItemToLocalStorage('edgeId', extId);
        break;
      }
      case 'firefox': {
        await this.installAddOnHelper(
          path.join(
            __dirname,
            '..',
            '..',
            'dist',
            'keeper-wallet-2.9.0-firefox.xpi'
          )
        );
        const extId = await basePage.getExtensionId(firefoxExtensionId);
        I.amOnPage(basePage.BROWSER_URLS.GECKO(extId).POPUP_URI);
        I.waitForElement(
          accountPage.SELECTORS.GET_STARTED_BUTTON,
          clockUnit.SECONDS * 30
        );
        I.closeCurrentTab();
        await basePage.setItemToLocalStorage('firefoxId', extId);
      }
    }
  };

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

    switch (args) {
      case 'MicrosoftEdge': {
        I.waitForElement(edgeRestartWorkerButton, clockUnit.SECONDS * 30);
        I.click(edgeRestartWorkerButton);
        I.waitForDetached(edgeWorkerActiveStatus, clockUnit.SECONDS * 30);
        I.dontSeeElement(edgeWorkerActiveStatus);
        I.click(edgeRestartWorkerButton);
        I.seeElement(edgeWorkerActiveStatus);
        break;
      }
    }
    I.waitForElement(detailsButtonSelector, clockUnit.SECONDS * 30);
    I.click(detailsButtonSelector);
    I.waitForElement(restartWorkerButton, clockUnit.SECONDS * 30);
    I.click(restartWorkerButton);
    I.waitForElement(workerInactiveStatus, clockUnit.SECONDS * 30);
    I.seeTextEquals('No active views', workerInactiveStatus);
    I.click(restartWorkerButton);
    I.waitForElement(workerActiveStatus, clockUnit.SECONDS * 30);
    I.seeElement(workerActiveStatus);
  };
}
