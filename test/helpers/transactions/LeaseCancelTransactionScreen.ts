export const LeaseCancelTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@']");
  },

  get cancelLeaseAmount() {
    return this.root.findByTestId$('cancelLeaseAmount');
  },

  get cancelLeaseRecipient() {
    return this.root.findByTestId$('cancelLeaseRecipient');
  },
};
