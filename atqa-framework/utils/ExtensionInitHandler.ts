import { BasePage } from '../tests/pages/BasePage';
import { ExtensionInitPage } from '../tests/pages/ExtensionInitPage';
import { Locator } from '../interfaces/Locator.interface';
import { AccountPage } from '../tests/pages/AccountPage';
import { ClockUnit } from './clockUnit';
import fs from 'fs-extra';
import path from 'path';

const extensionInitPage = new ExtensionInitPage();
const basePage = new BasePage();
const accountPage = new AccountPage();
const clockUnit = new ClockUnit();

const { I } = inject();
const args = process.env.BROWSER_INIT_NAME;

export class ExtensionInitHandler {
  //TODO: get the file through the resource provider
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
        I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_URI);
        I.waitForElement(
          accountPage.SELECTORS.GET_STARTED_BUTTON,
          clockUnit.SECONDS * 30
        );
        I.closeCurrentTab();
        break;
      }
      case 'opera': {
        const extId = await basePage.getExtensionId(chromiumExtensionId);
        I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_URI);
        I.waitForElement(
          accountPage.SELECTORS.GET_STARTED_BUTTON,
          clockUnit.SECONDS * 30
        );
        I.switchToNextTab(2);
        break;
      }
      case 'MicrosoftEdge': {
        const extId = await basePage.getExtensionId(edgeExtensionId);
        I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_URI);
        I.waitForElement(
          accountPage.SELECTORS.GET_STARTED_BUTTON,
          clockUnit.SECONDS * 30
        );
        I.closeCurrentTab();
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
      }
    }
  };
}
