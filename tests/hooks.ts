import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as path from 'path';

export const mochaHooks = () => {
    const extension = {
        id: 'bdlknklhmkfbfepohcgmppafcjgfdojg',
        path: path.resolve(__dirname, '..', 'dist', 'chrome'),
    };

    return {
        async beforeAll() {
            this.timeout(60 * 1000);
            this.wait = 10 * 1000;
            this.extension = extension;
            this.driver = new Builder()
                .forBrowser('chrome')
                .setChromeOptions(new chrome.Options().addArguments(`--load-extension=${extension.path}`))
                .build() as WebDriver;
            // FIXME wait until extension ready, some kind of glitch
            await this.driver.get('chrome://new-tab-page');
            await this.driver.get(`chrome-extension://${this.extension.id}/popup.html`);
        },
        afterAll(done) {
            this.driver.quit();
            done();
        },
    };
};
