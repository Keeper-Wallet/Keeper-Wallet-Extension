export const LeaseTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@']");
  },

  get leaseAmount() {
    return this.root.findByTestId$('leaseAmount');
  },

  get leaseRecipient() {
    return this.root.findByTestId$('leaseRecipient');
  },
};
