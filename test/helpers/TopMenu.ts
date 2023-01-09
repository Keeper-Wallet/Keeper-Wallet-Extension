export const NetworksMenu = {
  get root() {
    return browser.$("[class*='network@network']");
  },

  networkByName(network: string) {
    return this.root.findByText$(network, {selector: "[class*='chooseNetwork@network']"});
  },

  get editButton() {
    return this.root.$("[class*='editBtn@network']");
  },

  get networkMenuButton() {
    return this.root.$("[class*='networkBottom@network']");
  },
};

export const TopMenu = {
  get backButton() {
    return browser.$('.arrow-back-icon');
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

  get addressError() {
    return this.root.$('#nodeAddressError');
  },
};
