export const CancelOrderTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get orderId() {
    return this.root.findByTestId$('cancelOrderOrderId');
  },
};
