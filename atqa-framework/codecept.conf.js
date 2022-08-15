require('ts-node/register');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv-safe').config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BrowserCaps = require('./browserCaps');
const browserInit = new BrowserCaps();

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
      desiredCapabilities: (() => {
        return browserInit.initCaps();
      })(),
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
