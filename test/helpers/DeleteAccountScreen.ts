export const DeleteAccountScreen = {
  get root() {
    return $("[class*='content@deleteAccount']");
  },

  get deleteAccountButton() {
    return this.root.findByText$('Delete account');
  },
};
