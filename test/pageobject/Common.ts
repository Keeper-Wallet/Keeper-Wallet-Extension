const NetworksMenu = (wrapped: WebdriverIO.Element) => ({
  async networkByName(network: string) {
    return await wrapped.findByText$(network);
  },

  get editButton() {
    return wrapped.$("[class*='editBtn@network']");
  },
});

export const Common = {
  get backButton() {
    return browser.$('.arrow-back-icon');
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

export const CustomNetworkModal = {
  get root() {
    return browser.$('#customNetwork');
  },

  get addressInput() {
    return this.root.$('#node_address');
  },

  get matcherAddressInput() {
    return this.root.$('#matcher_address');
  },

  get saveButton() {
    return this.root.$('#networkSettingsSave');
  },

  get addressErrorField() {
    return this.root.$('#nodeAddressError');
  },
};
