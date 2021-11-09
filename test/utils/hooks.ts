import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as path from 'path';
import { GenericContainer } from 'testcontainers';
import { App } from './actions';

export const mochaHooks = () => ({
  async beforeAll() {
    this.timeout(15 * 60 * 1000);
    this.wait = 10 * 1000;

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
      .withExposedPorts(4444)
      .start();

    this.driver = new Builder()
      .forBrowser('chrome')
      .usingServer(
        `http://${this.selenium.getHost()}:${this.selenium.getMappedPort(
          4444
        )}/wd/hub`
      )
      .setChromeOptions(
        new chrome.Options().addArguments(
          `--load-extension=/app/dist/chrome`,
          '--disable-dev-shm-usage'
        )
      )
      .build();

    // detect Waves Keeper extension URL
    await this.driver.get('chrome://system');
    for (const ext of (
      await this.driver
        .wait(until.elementLocated(By.css('div#extensions-value')))
        .getText()
    ).split('\n')) {
      const [id, name] = ext.split(' : ');
      if (name.toLowerCase() === 'Waves Keeper'.toLowerCase()) {
        this.extensionUrl = `chrome-extension://${id}/popup.html`;
        break;
      }
    }
    // this helps extension to be ready
    await this.driver.get('chrome://new-tab-page');
    await App.open.call(this);
  },
  afterAll(done) {
    this.driver && this.driver.quit();
    this.selenium && this.selenium.stop();
    done();
  },
});
