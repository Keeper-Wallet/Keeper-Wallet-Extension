export const ImportFormScreen = {
  get root() {
    return browser.findByTestId$('importForm');
  },

  get createNewAccountButton() {
    return this.root.findByText$('Create a new account');
  },

  get importViaSeedButton() {
    return this.root.findByText$('Seed Phrase or Private Key');
  },

  get importByKeystoreFileButton() {
    return this.root.findByText$('Keystore File');
  },
};
