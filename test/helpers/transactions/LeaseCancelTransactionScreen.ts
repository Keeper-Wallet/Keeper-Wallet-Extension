export const LeaseCancelTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get cancelLeaseAmount() {
    return this.root.findByTestId$('cancelLeaseAmount');
  },

  get cancelLeaseRecipient() {
    return this.root.findByTestId$('cancelLeaseRecipient');
  },
};
