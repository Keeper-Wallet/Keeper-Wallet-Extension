export const ReissueTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get reissueAmount() {
    return this.root.findByTestId$('reissueAmount');
  },

  get reissuableType() {
    return this.root.findByTestId$('reissueReissuable');
  },
};
