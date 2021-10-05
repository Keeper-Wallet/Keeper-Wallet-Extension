import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as path from 'path';

export const mochaHooks = () => {
    const extension = {
        id: 'bdlknklhmkfbfepohcgmppafcjgfdojg',
        path: path.resolve(__dirname, '..', 'dist', 'chrome'),
    };

    return {
        beforeAll(done) {
            this.extension = extension;
            this.driver = new Builder()
                .forBrowser('chrome')
                .setChromeOptions(new chrome.Options().addArguments(`--load-extension=${extension.path}`))
                .build() as WebDriver;
            this.wait = 10 * 1000;
            done();
        },
        afterAll(done) {
            this.driver.quit();
            done();
        },
    };
};
