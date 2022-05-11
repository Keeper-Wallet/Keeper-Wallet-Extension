import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as net from 'net';
import * as mocha from 'mocha';
import * as path from 'path';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { App } from './actions';

declare global {
  const KeeperWallet: WavesKeeper.TWavesKeeperApi;

  interface Window {
    result: unknown;
    approveResult: unknown;
  }
}

declare module 'mocha' {
  interface Context {
    driver: WebDriver;
    extensionUrl: string;
    wait: number;
  }
}

interface GlobalFixturesContext {
  selenium: StartedTestContainer;
}

export async function mochaGlobalSetup(this: GlobalFixturesContext) {
  const exposedPorts = [4444, 5900];

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
    .withExposedPorts(...exposedPorts)
    .start();

  await Promise.all(
    exposedPorts.map(
      (port: number) =>
        new Promise((resolve, reject) => {
          net
            .createServer(from => {
              const to = net.createConnection({
                port: this.selenium.getMappedPort(port),
              });

              from.pipe(to);
              to.pipe(from);

              to.once('error', () => {
                from.destroy();
              });
            })
            .once('listening', resolve)
            .once('error', reject)
            .listen(port)
            .unref();
        })
    )
  );
}

export async function mochaGlobalTeardown(this: GlobalFixturesContext) {
  await this.selenium.stop();
}

export const mochaHooks = () => ({
  async beforeAll(this: mocha.Context) {
    this.timeout(15 * 60 * 1000);
    this.wait = 10 * 1000;

    this.driver = new Builder()
      .forBrowser('chrome')
      .usingServer(`http://localhost:4444/wd/hub`)
      .setChromeOptions(
        new chrome.Options().addArguments(
          `--load-extension=/app/dist/chrome`,
          '--disable-dev-shm-usage'
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
        break;
      }
    }

    // this helps extension to be ready
    await this.driver.get('chrome://new-tab-page');
    await App.open.call(this);
  },

  afterAll(this: mocha.Context, done: mocha.Done) {
    this.driver && this.driver.quit();
    done();
  },
});
