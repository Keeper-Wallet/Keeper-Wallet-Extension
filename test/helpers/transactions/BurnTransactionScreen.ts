export const BurnTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@']");
  },

  get burnAmount() {
    return this.root.findByTestId$('burnAmount');
  },
};
