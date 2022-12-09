const NetworksMenu = (wrapped: WebdriverIO.Element) => ({
  async networkByName(network: string) {
    return await wrapped.findByText$(network);
  }
});

export const Common = {
  get backButton() {
    return browser.$(".arrow-back-icon");
  },

  get networkMenuButton() {
    return browser.$("[class*='networkBottom@network']");
  },

  async getNetworksMenu() {
    return NetworksMenu(await browser.$("[class*='selectNetworks@network']"));
  },

  get settingsButton() {
    return browser.$("[class*='settingsIcon@menu']");
  },
};