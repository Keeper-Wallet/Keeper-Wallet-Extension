export const FinalTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@']");
  },

  get transactionContent() {
    return this.root.$("[class*='transactionContent']");
  },

  get closeButton() {
    return this.root.findByText$('Close');
  },
};
