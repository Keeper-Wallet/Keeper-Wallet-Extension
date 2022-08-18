import { ClockUnit } from '../../utils/clockUnit';
import { Locator } from '../../interfaces/Locator.interface';
import { Url } from '../../interfaces/Url.interface';

const clockUnit = new ClockUnit();
const { I } = inject();

export class BasePage {
  BROWSER_URLS = {
    CHROMIUM: (id: string): Url => ({
      POPUP_HTML: `chrome-extension://${id}/popup.html`,
      ACCOUNTS_HTML: `chrome-extension://${id}/accounts.html`,
    }),
    GECKO: (id: string): Url => ({
      POPUP_URI: `moz-extension://${id}/popup.html`,
    }),
    CHROME_SYSTEM: 'chrome://system/',
    CHROMIUM_EXTENSIONS_PAGE: 'chrome://extensions/',
    FIREFOX_EXTENSIONS_PAGE: '#/runtime/this-about:debuggingfirefox',
  };

  BROWSER_SELECTORS = {
    CHROMIUM_EXTENSION_VALUE_BUTTON: { id: 'extensions-value-btn' },
    CHROMIUM_EXTENSIONS_LIST: { xpath: '(//div[@class="stat-value"])[5]' },
    CHROMIUM: {
      UPDATE_EXTENSION_BUTTON: {
        shadow: ['extensions-manager', 'extensions-toolbar', '#updateNow'],
      },
      DETAILS_BUTTON: {
        shadow: [
          'extensions-manager',
          'extensions-item-list',
          'extensions-item',
          '#detailsButton',
        ],
      },
      DEV_MODE_TOGGLE: {
        shadow: ['extensions-manager', 'extensions-toolbar', '#devMode'],
      },
    },
    EDGE: {
      SERVICE_WORKER_RESTART_BUTTON: {
        css: '[aria-label="Turn on Keeper Wallet"]',
      },
      DETAILS_BUTTON: { xpath: '//span[contains(text(),"Details")]' },
      DEV_MODE_TOGGLE: { css: '#developer-mode' },
      EXTENSION_MENU_BUTTON: {
        xpath: '(//button[@aria-label= "Extensions menu"])[2]',
      },
      UPDATE_EXTENSION_BUTTON: { xpath: '//span[contains(text(),"Reload")]' },
    },
    FIREFOX: {
      MANIFEST_EMAIL_TEXT: 'support@wavesplatform.com',
    },
  };

  // TODO: Fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getItemFromLocalStorage = async (keyName: string): Promise<any> => {
    return I.executeScript((key) => {
      return window.localStorage.getItem(key);
    }, `data-qa:${keyName}`);
  };

  setItemToLocalStorage = async (
    keyName: string,
    keyValue: string
  ): Promise<void> => {
    await I.executeScript(
      ([key, value]) => {
        window.localStorage.setItem(key, value);
      },
      [`data-qa:${keyName}`, keyValue]
    );
  };

  getExtensionId = async (element: Locator): Promise<string> => {
    const devModeSelector: Locator =
      this.BROWSER_SELECTORS.CHROMIUM.DEV_MODE_TOGGLE;
    const detailButtonSelector: Locator =
      this.BROWSER_SELECTORS.CHROMIUM.DETAILS_BUTTON;
    const edgeDevModeSelector: Locator =
      this.BROWSER_SELECTORS.EDGE.DEV_MODE_TOGGLE;
    const edgeDetailsButton: Locator =
      this.BROWSER_SELECTORS.EDGE.DETAILS_BUTTON;
    const chromiumExtensionPage: Locator =
      this.BROWSER_URLS.CHROMIUM_EXTENSIONS_PAGE;
    const firefoxExtensionPage: Locator =
      this.BROWSER_URLS.FIREFOX_EXTENSIONS_PAGE;
    const firefoxManifestEmail: Locator =
      this.BROWSER_SELECTORS.FIREFOX.MANIFEST_EMAIL_TEXT;

    switch (process.env.BROWSER_INIT_NAME) {
      case 'opera':
        I.amOnPage(chromiumExtensionPage);
        I.waitForElement(devModeSelector);
        I.click(devModeSelector);

        I.waitForElement(detailButtonSelector);
        I.click(detailButtonSelector);
        break;
      case 'chrome':
        I.amOnPage(chromiumExtensionPage);
        I.waitForElement(devModeSelector);
        I.click(devModeSelector);

        I.waitForElement(detailButtonSelector);
        I.click(detailButtonSelector);
        break;
      case 'MicrosoftEdge':
        I.amOnPage(chromiumExtensionPage);
        I.waitForElement(edgeDevModeSelector);
        I.click(edgeDevModeSelector);

        I.waitForElement(edgeDetailsButton);
        I.click(edgeDetailsButton);
        break;
      case 'firefox':
        I.amOnPage(firefoxExtensionPage);
        I.waitForText(firefoxManifestEmail, clockUnit.SECONDS * 30);
        break;
      default:
    }
    I.waitForElement(element);
    return I.grabTextFrom(element);
  };
}
