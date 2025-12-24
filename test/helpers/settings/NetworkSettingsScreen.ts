export const NetworkSettingsScreen = {
  get root() {
    return $("[data-testid='networkSettings'],[class*='networkTab@settings']");
  },

  get showTestNetworksToggle() {
    return this.root.$('input[type="checkbox"]');
  },

  get customNetworkOption() {
    return this.root.findByText$('Waves Custom');
  },

  get nodeAddress() {
    return $('#node_address');
  },

  get matcherAddress() {
    return $('#matcher_address');
  },

  get modalCloseButton() {
    return $('.modal-close');
  },
};
