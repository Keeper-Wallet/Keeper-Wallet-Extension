export const SuccessTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@final']");
  },

  get transactionContent() {
    return this.root.$("[class*='transactionContent']");
  },

  get closeButton() {
    return this.root.findByText$('Close');
  },
};
