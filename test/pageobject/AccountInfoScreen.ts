export const AccountInfoScreen = {
  get root() {
    return browser.$("[class*='content@accountInfo']");
  },

  get deleteAccountButton() {
    return this.root.findByText$("Delete account");
  }
}