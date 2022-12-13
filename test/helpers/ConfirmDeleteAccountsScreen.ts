export const ConfirmDeleteAccountsScreen = {
  get root() {
    return browser.findByTestId$('deleteAllAccounts');
  },

  get confirmPhraseInput() {
    return this.root.findByTestId$('confirmPhrase');
  },

  get deleteAllButton() {
    return this.root.findByTestId$('resetConfirm');
  },
};
