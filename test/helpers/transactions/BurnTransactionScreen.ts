export const BurnTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@burn]");
  },

  get burnAmount() {
    return this.root.findByTestId$('burnAmount');
  },
};
