import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as path from 'path';
import { GenericContainer } from 'testcontainers';
import { App } from './actions';

export const mochaHooks = () => {
    const extPath = '/app';

    return {
        async beforeAll() {
            this.timeout(15 * 60 * 1000);
            this.wait = 10 * 1000;
            // this.selenium = await (await GenericContainer.fromDockerfile(path.resolve(__dirname, '..', '..')).build())
            //     .withExposedPorts(4444)
            //     .start();

            this.driver = new Builder()
                .forBrowser('chrome')
                .usingServer(`http://127.0.0.1:4444/wd/hub`)
                .setChromeOptions(
                    new chrome.Options().addArguments(`--load-extension=${extPath}`, '--disable-dev-shm-usage')
                )
                .build() as WebDriver;

            // detect Waves Keeper extension URL
            await this.driver.get('chrome://system');
            for (const ext of (
                await this.driver.wait(until.elementLocated(By.css('div#extensions-value'))).getText()
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
    };
};
