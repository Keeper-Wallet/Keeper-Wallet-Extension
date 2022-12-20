export const LeaseCancelTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@cancelLease']");
  },

  get cancelLeaseAmount() {
    return this.root.findByTestId$('cancelLeaseAmount');
  },

  get cancelLeaseRecipient() {
    return this.root.findByTestId$('cancelLeaseRecipient');
  },
};
