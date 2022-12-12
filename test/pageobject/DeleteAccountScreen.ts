export const DeleteAccountScreen = {
  get root() {
    return browser.$("[class*='content@deleteAccount']");
  },

  get deleteAccountButton() {
    return this.root.findByText$('Delete account');
  },
};
