export const TransferTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get transferAmount() {
    return this.root.findByTestId$('transferAmount');
  },

  get recipient() {
    return this.root.findByTestId$('recipient');
  },

  get attachmentContent() {
    return this.root.findByTestId$('attachmentContent');
  },

  get rejectButton() {
    return this.root.findByTestId$('rejectButton');
  },
};
