export const NetworkSettingsScreen = {
  get root() {
    return $("[class*='networkTab@settings']");
  },

  get nodeAddress() {
    return this.root.$('#node_address');
  },

  get matcherAddress() {
    return this.root.$('#node_address');
  },

  get setDefaultButton() {
    return this.root.$('#setDefault');
  },
};
