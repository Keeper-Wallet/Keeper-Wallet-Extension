import { ClockUnit } from '../../utils/clockUnit';
import { Locator } from '../../interfaces/Locator.interface';

const clockUnit = new ClockUnit();
const { I } = inject();

export class BasePage {
  public BROWSER_URLS = {
    CHROMIUM: (id: string) => ({
      POPUP_HTML: `chrome-extension://${id}/popup.html`,
      ACCOUNTS_HTML: `chrome-extension://${id}/accounts.html`,
    }),
    GECKO: (id: string) => ({
      POPUP_URI: `moz-extension://${id}/popup.html`,
    }),
    CHROME_SYSTEM: 'chrome://system/',
    CHROMIUM_EXTENSIONS_PAGE: 'chrome://extensions/',
    FIREFOX_EXTENSIONS_PAGE: 'about:debugging#/runtime/this-firefox',
  };

  public BROWSER_SELECTORS = {
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
      DETAILS_BUTTON: { xpath: '//span[contains(text(),"Details")]' },
      DEV_MODE_TOGGLE: { css: '#developer-mode' },
      EXTENSION_MENU_BUTTON: {
        xpath: '(//button[@aria-label= "Extensions menu"])[2]',
      },
      UPDATE_EXTENSION_BUTTON: '#update-button',
    },
    FIREFOX: {
      MANIFEST_EMAIL_TEXT: 'support@wavesplatform.com',
    },
  };

  //TODO: Fix any type
  getItemFromLocalStorage = async (keyName: string): Promise<any> => {
    return I.executeScript(key => {
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

  //TODO: Make it workable and init as main method for getId (now the elements on the system page can't be found for some reason)
  getChromeExtensionId = async (): Promise<string> => {
    I.amOnPage(this.BROWSER_URLS.CHROME_SYSTEM);
    I.seeElement({
      xpath: '//*[@id="extensions-value"]',
    });
    I.wait(clockUnit.SECONDS * 10);
    const extList = await I.grabTextFrom({
      xpath: '//*[@id="extensions-value"]',
    });
    console.log(extList);
    let goo = '';
    let [id, name] = '';
    for (goo of extList.split('\n')) {
      [id, name] = goo.split(' : ');
      if (name.toLowerCase() === 'Keeper Wallet'.toLowerCase()) {
        console.log(id, 'EXT ID');
      }
    }
    return id;
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
    }
    I.waitForElement(element);
    return await I.grabTextFrom(element);
  };
}
