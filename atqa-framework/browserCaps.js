module.exports = class BrowserCaps {
  static initCaps() {
    let capabilities = {
      selenoidOptions: {
        enableVNC: true,
        enableVideo: false,
        enableLog: true,
        browserName: process.env.BROWSER_INIT_NAME,
        browserVersion: process.env.BROWSER_VERSION,
      },
    };
    switch (process.env.BROWSER_INIT_NAME) {
      case 'MicrosoftEdge':
        capabilities = {
          ...capabilities,
          'ms:edgeOptions': {
            args: [
              '--load-extension=/home/selenium/edge',
              '--start-fullscreen',
            ],
          },
        };
        return capabilities;
      case 'opera':
        capabilities = {
          ...capabilities,
          'goog:chromeOptions': {
            args: [
              '--load-extension=/home/selenium/opera',
              // '--start-fullscreen',
            ],
          },
        };
        return capabilities;
      case 'chrome':
        capabilities = {
          ...capabilities,
          'goog:chromeOptions': {
            args: [
              '--load-extension=/home/selenium/chrome',
              // '--start-fullscreen',
            ],
          },
        };
        return capabilities;
      case 'firefox':
        return capabilities;
      default:
        throw new Error(
          `BROWSER_INIT_NAME has an invalid value: ${process.env.BROWSER_INIT_NAME}}`
        );
    }
  }
};
