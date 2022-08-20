import { Locator } from '../../interfaces/Locator.interface';

export interface IterableConstant {
  [key: string]: string;
}

const { I } = inject();

export class BasePage {
  BROWSER_URLS = {
    POPUP: '/popup.html',
    ACCOUNTS: '/accounts.html',
    CHROME_SYSTEM: 'chrome://system/',
    CHROMIUM_EXTENSIONS: 'chrome://extensions/',
    FIREFOX_EXTENSIONS: '#/runtime/this-about:debuggingfirefox',
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

  AVAILABILITY = {
    AVAILABLE: 'available',
    NOT_AVAILABLE: 'not available',
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

  checkElementAvailability = async (
    locator: Locator,
    availability: string
  ): Promise<void> => {
    if (availability === this.AVAILABILITY.AVAILABLE) {
      I.waitForElement(locator);
      I.seeElement(locator);
    } else if (availability === this.AVAILABILITY.NOT_AVAILABLE) {
      I.dontSeeElement(locator);
    }
  };
}
