const Argument = (wrapped: WebdriverIO.Element) => ({
  get type() {
    return wrapped.findByTestId$('invokeArgumentType');
  },

  get value() {
    return wrapped.findByTestId$('invokeArgumentValue');
  },
});

export const InvokeScriptTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get paymentsTitle() {
    return this.root.findByTestId$('invokeScriptPaymentsTitle');
  },

  get dApp() {
    return this.root.findByTestId$('invokeScriptDApp');
  },

  get function() {
    return this.root.findByTestId$('invokeScriptFunction');
  },

  async getArguments() {
    await this.root.waitForDisplayed();
    return await this.root
      .queryAllByTestId$('invokeArgument')
      .map(it => Argument(it));
  },

  async getPayments() {
    await this.root.waitForDisplayed();
    return await this.root.queryAllByTestId$('invokeScriptPaymentItem');
  },
};
