export const ContentScript = {
  waitForKeeperWallet() {
    return browser.executeAsync((done: () => void) => {
      (function poll() {
        if (typeof KeeperWallet !== 'undefined') done();
        else setTimeout(() => poll(), 100);
      })();
    });
  },
};
