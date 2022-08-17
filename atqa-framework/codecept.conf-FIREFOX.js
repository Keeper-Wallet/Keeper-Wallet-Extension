require('ts-node/register');
// const fs = require('fs-extra')
// const FirefoxProfile = require('firefox-profile');
// const extPath = fs.readFileSync('/Users/a1/waves/atqa-waves/extension/keeper-wallet-2.8.1-chrome.crx', {encoding: "base64"});
// const fp = new FirefoxProfile();

exports.config = {
  name: 'waves',
  output: 'output',
  helpers: {
    WebDriver: {
      // host: 'localhost',
      // protocol: 'http',
      // port: 4444,
      restart: false,
      keepCookies: false,
      keepBrowserState: false,
      url: 'https://localhost/',
      browser: 'firefox',
      desiredCapabilities: {},
    },
  },
  jest: {},
  bootstrap: null,
  teardown: null,
  tests: './tests/*.Test.ts',
  gherkin: {
    features: './*/features/**/*.feature',
    steps: './*/*steps/**/*.*s',
  },
  plugins: {
    wdio: {
      enabled: true,
      services: ['selenium-standalone', 'firefox-profile'],
      drivers: { firefox: true },
      // args: {
      //    version: true,
      //    seleniumArgs: ['-host', '127.0.0.1','-port', '5555']
      // },
      // capabilities: {
      //    browserName: 'firefox',
      //    port: 5555,
      //    'xpinstall.signatures.required': false,
      // },
      firefoxProfile: {
        extensions: ['/Users/a1/waves/atqa-waves/extension/firefox'],
        'xpinstall.signatures.required': false,
        'browser.startup.homepage': 'https://webdriver.io',
      },
    },
    screenshotOnFail: {
      enabled: true,
    },
    allure: {
      enabled: true,
    },
  },
};
