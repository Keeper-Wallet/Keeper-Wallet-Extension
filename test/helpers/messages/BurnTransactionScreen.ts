export const BurnTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get burnAmount() {
    return this.root.findByTestId$('burnAmount');
  },
};
