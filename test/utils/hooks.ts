import * as mocha from 'mocha';
import {
  Builder,
  By,
  Capabilities,
  until,
  WebDriver,
} from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

declare global {
  interface Window {
    result: unknown;
  }
}

declare module 'mocha' {
  interface Context {
    driver: WebDriver;
    extensionUrl: string;
    extensionPanel: string;
    nodeUrl: string;
    wait: number;
  }
}

export const mochaHooks = () => ({
  async beforeAll(this: mocha.Context) {
    this.wait = 15 * 1000;

    const capabilities = new Capabilities().setPageLoadStrategy('eager');

    const chromeOptions = new chrome.Options().addArguments(
      '--disable-web-security',
      '--load-extension=/app/dist/chrome'
    );

    // there's no chrome builds for linux arm, so seleniarm uses chromium
    if (process.arch === 'arm' || process.arch === 'arm64') {
      chromeOptions.setChromeBinaryPath('/usr/bin/chromium');
    }

    this.driver = new Builder()
      .withCapabilities(capabilities)
      .forBrowser('chrome')
      .usingServer(`http://localhost:4444/wd/hub`)
      .setChromeOptions(chromeOptions)
      .build();

    // detect Keeper Wallet extension URL
    await this.driver.get('chrome://system');
    for (const ext of (
      await this.driver
        .wait(until.elementLocated(By.css('div#extensions-value')))
        .getText()
    ).split('\n')) {
      const [id, name] = ext.split(' : ');
      if (name.toLowerCase() === 'Keeper Wallet'.toLowerCase()) {
        this.extensionUrl = `chrome-extension://${id}/popup.html`;
        this.extensionPanel = `chrome://extensions/?id=${id}`;
        this.nodeUrl = 'http://waves-private-node:6869';
        break;
      }
    }

    // this helps extension to be ready
    await this.driver.get('chrome://new-tab-page');
  },

  async afterAll(this: mocha.Context) {
    if (this.driver) {
      await this.driver.quit();
    }
  },
});
