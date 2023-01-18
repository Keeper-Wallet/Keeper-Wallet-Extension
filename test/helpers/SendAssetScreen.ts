export const SendAssetScreen = {
  get root() {
    return $("[class*='root@send-module']");
  },

  get recipientInput() {
    return this.root.findByTestId$('recipientInput');
  },

  get amountInput() {
    return this.root.findByTestId$('amountInput');
  },

  get attachmentInput() {
    return this.root.findByTestId$('attachmentInput');
  },

  get submitButton() {
    return this.root.findByTestId$('submitButton');
  },
};
