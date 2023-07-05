const TransferItem = (wrapped: WebdriverIO.Element) => ({
  get recipient() {
    return wrapped.findByTestId$('massTransferItemRecipient');
  },

  get amount() {
    return wrapped.findByTestId$('massTransferItemAmount');
  },
});

export const MassTransferTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get massTransferAmount() {
    return this.root.findByTestId$('massTransferAmount');
  },

  get massTransferAttachment() {
    return this.root.findByTestId$('massTransferAttachment');
  },

  async getTransferItems() {
    return (await this.root.findAllByTestId$('massTransferItem')).map(it =>
      TransferItem(it),
    );
  },
};
