require('ts-node/register');
require('dotenv-safe').config();
const BrowserCaps = require('./browserCaps');

exports.config = {
  name: 'waves',
  output: 'output',
  helpers: {
    WebDriver: {
      host: 'localhost',
      protocol: 'http',
      port: 4444,
      restart: true,
      keepCookies: false,
      keepBrowserState: false,
      url: 'https://localhost/',
      browser: process.env.BROWSER_INIT_NAME,
      desiredCapabilities: BrowserCaps.initCaps(),
      waitForTimeout: 40000,
      timeout: 40000,
    },
  },
  jest: {},
  bootstrap: null,
  teardown: null,
  tests: './tests/**/*.Test.ts',
  gherkin: {
    features: './*/*/features/**/*.feature',
    steps: './*/*/*steps/**/*.*s',
  },
  plugins: {
    customLocator: {
      enabled: true,
      attribute: 'data-testid',
    },
    screenshotOnFail: {
      enabled: true,
    },
    allure: {
      enabled: true,
    },
  },
};
