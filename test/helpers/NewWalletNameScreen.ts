export const NewWalletNameScreen = {
  get root() {
    return browser.findByTestId$('newWalletNameForm');
  },

  get nameInput() {
    return this.root.findByTestId$('newAccountNameInput');
  },

  get error() {
    return this.root.findByTestId$('newAccountNameError');
  },

  get continueButton() {
    return this.root.findByText$('Continue');
  },
};
