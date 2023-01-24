export const CommonTransaction = {
  get root() {
    return $("[class*='transaction@'], [class*='screen@']");
  },

  get transactionFee() {
    return this.root.findByTestId$('txFee');
  },

  get originAddress() {
    return this.root.$("[class*='originAddress@transactions']");
  },

  get accountName() {
    return this.root.$("[class*='name@wallet']");
  },

  get originNetwork() {
    return this.root.findByTestId$('originNetwork');
  },

  get rejectButton() {
    return this.root.$('#reject');
  },

  get approveButton() {
    return this.root.$('#approve');
  },
};
