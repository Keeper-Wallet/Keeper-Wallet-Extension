import * as mocha from 'mocha';
import * as path from 'path';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import {
  GenericContainer,
  Network,
  StartedTestContainer,
} from 'testcontainers';

import { App } from './actions';

declare global {
  interface Window {
    result: unknown;
  }
}

declare module 'mocha' {
  interface Context {
    serviceWorkerTab: string;
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
  selenium: StartedTestContainer;
  node: StartedTestContainer;
}

export async function mochaGlobalSetup(this: GlobalFixturesContext) {
  const host = await new Network().start();

  this.node = await new GenericContainer('wavesplatform/waves-private-node')
    .withExposedPorts(6869)
    .withNetworkMode(host.getName())
    .withNetworkAliases('waves-private-node')
    .start();

  this.selenium = await new GenericContainer('selenium/standalone-chrome')
    .withBindMount(
      path.resolve(__dirname, '..', '..', 'dist'),
      '/app/dist',
      'ro'
    )
    .withBindMount(
      path.resolve(__dirname, '..', 'fixtures'),
      '/app/test/fixtures',
      'ro'
    )
    .withExposedPorts(
      {
        container: 4444,
        host: 4444,
      },
      {
        container: 5900,
        host: 5900,
      },
      {
        container: 7900,
        host: 7900,
      }
    )
    .withNetworkMode(host.getName())
    .start();
}

export async function mochaGlobalTeardown(this: GlobalFixturesContext) {
  await this.selenium.stop();
  await this.node.stop();
}

export const mochaHooks = () => ({
  async beforeAll(this: mocha.Context) {
    this.timeout(15 * 60 * 1000);
    this.wait = 15 * 1000;

    this.driver = new Builder()
      .forBrowser('chrome')
      .usingServer(`http://localhost:4444/wd/hub`)
      .setChromeOptions(
        new chrome.Options().addArguments(
          '--load-extension=/app/dist/chrome',
          '--disable-dev-shm-usage',
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
    await App.openServiceWorkerTab.call(this);
  },

  async afterAll(this: mocha.Context) {
    if (this.driver) {
      await this.driver.quit();
    }
  },
});
