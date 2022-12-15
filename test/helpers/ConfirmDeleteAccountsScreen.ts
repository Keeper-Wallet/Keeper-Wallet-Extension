export const ConfirmDeleteAccountsScreen = {
  get root() {
    return browser.findByTestId$('deleteAllAccounts');
  },

  get confirmPhraseInput() {
    return this.root.findByTestId$('confirmPhrase');
  },

  get confirmPhraseError() {
    return this.root.findByTestId$('confirmPhraseError');
  },

  get cancelButton() {
    return this.root.findByTestId$('resetCancel');
  },

  get deleteAllButton() {
    return this.root.findByTestId$('resetConfirm');
  },
};
