const initBrowser = class BrowserCaps {
  initCaps() {
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
        capabilities = Object.assign({}, capabilities, {
          'ms:edgeOptions': {
            args: [
              '--load-extension=/home/selenium/edge',
              '--start-fullscreen',
            ],
          },
        });
        break;
      case 'opera':
        capabilities = Object.assign({}, capabilities, {
          'goog:chromeOptions': {
            args: [
              '--load-extension=/home/selenium/opera',
              // '--start-fullscreen',
            ],
          },
        });
        break;
      case 'chrome':
        capabilities = Object.assign({}, capabilities, {
          'goog:chromeOptions': {
            args: [
              '--load-extension=/home/selenium/chrome',
              // '--start-fullscreen',
            ],
          },
        });
        break;
      case 'firefox':
        return capabilities;
      default:
          throw new Error(`BROWSER_INIT_NAME has an invalid value: ${process.env.BROWSER_INIT_NAME}}`);
    }
    return capabilities;
  }
};

module.exports = initBrowser;
