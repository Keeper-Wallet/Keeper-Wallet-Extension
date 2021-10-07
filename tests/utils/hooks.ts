import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as path from 'path';

export const mochaHooks = () => {
    const extId = 'bdlknklhmkfbfepohcgmppafcjgfdojg',
        extPath = path.resolve(__dirname, '..', '..', 'dist', 'chrome'),
        extUrl = `chrome-extension://${extId}/popup.html`;

    return {
        async beforeAll() {
            this.timeout(60 * 1000);
            this.wait = 10 * 1000;
            this.extensionUrl = extUrl;
            this.driver = new Builder()
                .forBrowser('chrome')
                .setChromeOptions(new chrome.Options().addArguments(`--load-extension=${extPath}`))
                .build() as WebDriver;
            // FIXME wait until extension ready, some kind of glitch
            await this.driver.get('chrome://new-tab-page');
            await this.driver.get(this.extensionUrl);
        },
        afterAll(done) {
            this.driver.quit();
            done();
        },
    };
};
