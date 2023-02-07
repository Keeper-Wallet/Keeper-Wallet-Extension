export const FinalTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get transactionContent() {
    return this.root.$("[class*='transactionContent']");
  },

  get closeButton() {
    return browser.findByText$('Close');
  },
};
