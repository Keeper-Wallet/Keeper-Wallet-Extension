export const CancelOrderTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@']");
  },

  get orderId() {
    return this.root.findByTestId$('cancelOrderOrderId');
  },
};
