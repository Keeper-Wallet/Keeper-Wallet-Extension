import * as mocha from 'mocha';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from 'testcontainers';

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

declare module 'selenium-webdriver' {
  interface WebElement {
    getShadowRoot: () => WebElement;
  }
}

interface GlobalFixturesContext {
  compose: StartedDockerComposeEnvironment;
}

export async function mochaGlobalSetup(this: GlobalFixturesContext) {
  this.compose = await new DockerComposeEnvironment(
    '.',
    'docker-compose.yml'
  ).up([
    'waves-private-node',
    'chrome',
    ...(process.env.TEST_WATCH ? [] : ['chrome-video']),
  ]);
}

export async function mochaGlobalTeardown(this: GlobalFixturesContext) {
  await this.compose.down();
}

export const mochaHooks = () => ({
  async beforeAll(this: mocha.Context) {
    this.wait = 30 * 1000;

    this.driver = new Builder()
      .forBrowser('chrome')
      .usingServer(`http://localhost:4444/wd/hub`)
      .setChromeOptions(
        new chrome.Options().addArguments(
          '--load-extension=/app/dist/chrome',
          '--disable-web-security'
        )
      )
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
