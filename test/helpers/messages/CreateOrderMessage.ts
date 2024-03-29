export const CreateOrderMessage = {
  get root() {
    return $("[class*='transaction@']");
  },

  get orderTitle() {
    return this.root.findByTestId$('createOrderTitle');
  },

  get orderAmount() {
    return this.root.findByTestId$('createOrderTitleAmount');
  },

  get orderPriceTitle() {
    return this.root.findByTestId$('createOrderTitlePrice');
  },

  get orderPrice() {
    return this.root.findByTestId$('createOrderPrice');
  },

  get orderMatcherPublicKey() {
    return this.root.findByTestId$('createOrderMatcherPublicKey');
  },

  get createOrderFee() {
    return this.root.findByTestId$('createOrderFee');
  },
};
