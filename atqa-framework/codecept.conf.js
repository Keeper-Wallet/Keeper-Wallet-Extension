require('ts-node/register');

exports.config = {
  name: 'Waves ATQA Framework',
  output: 'output',
  helpers: {
    WebDriver: {
      url: '/',
      browser: 'chrome',
    },
  },
  jest: {},
  bootstrap: null,
  teardown: null,
  tests: './atqa-framework/tests/**/*.Test.ts',
  // gherkin: {
  //  features: './*/features/**/*.feature',
  //  steps: './*/*steps/**/*.*s',
  // },
  plugins: {
    screenshotOnFail: {
      enabled: true,
    },
    allure: {
      enabled: true,
    },
  },
};
