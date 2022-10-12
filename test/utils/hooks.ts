import * as mocha from 'mocha';
import * as path from 'path';
import { Session, WebDriver } from 'selenium-webdriver';
import { Executor, HttpClient } from 'selenium-webdriver/http';
import {
  GenericContainer,
  Network,
  StartedTestContainer,
} from 'testcontainers';
import { remote } from 'webdriverio';

declare global {
  interface Window {
    result: unknown;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      browser: typeof browser;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace WebdriverIO {
    interface Browser {
      openKeeperPopup: () => Promise<void>;
    }
  }
}

declare module 'mocha' {
  interface Context {
    driver: WebDriver;
    nodeUrl: string;
    wait: number;
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
    this.nodeUrl = 'http://waves-private-node:6869';

    global.browser = await remote({
      logLevel: 'warn',
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: [
            '--load-extension=/app/dist/chrome',
            '--disable-dev-shm-usage',
            '--disable-web-security',
          ],
        },
      },
      path: '/wd/hub',
      waitforTimeout: this.wait,
    });

    global.$ = browser.$.bind(browser);
    global.$$ = browser.$$.bind(browser);

    this.driver = new WebDriver(
      new Session(browser.sessionId, {}),
      new Executor(new HttpClient('http://localhost:4444/wd/hub'))
    );

    // detect Keeper Wallet extension URL
    await browser.navigateTo('chrome://system');

    let keeperExtensionId: string | undefined;

    const extensionsValue = await $('#extensions-value').getText();
    for (const ext of extensionsValue.split('\n')) {
      const [id, name] = ext.split(' : ');

      if (name.toLowerCase() === 'keeper wallet') {
        keeperExtensionId = id;
        break;
      }
    }

    if (!keeperExtensionId) {
      throw new Error('Could not find Keeper Wallet extension id');
    }

    browser.addCommand('openKeeperPopup', async () => {
      await browser.navigateTo(
        `chrome-extension://${keeperExtensionId}/popup.html`
      );
    });
  },

  async afterAll(this: mocha.Context) {
    browser.deleteSession();
  },
});
