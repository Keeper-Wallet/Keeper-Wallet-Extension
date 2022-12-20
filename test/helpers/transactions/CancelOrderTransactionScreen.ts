export const CancelOrderTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@cancelOrder']");
  },

  get orderId() {
    return this.root.findByTestId$('cancelOrderOrderId');
  },
};
