export const CustomNetworkModal = {
  get root() {
    return $('#customNetwork');
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
