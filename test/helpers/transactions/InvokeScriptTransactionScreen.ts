const Argument = (wrapped: WebdriverIO.Element) => ({
  get type() {
    return wrapped.findByTestId$('invokeArgumentType');
  },

  get value() {
    return wrapped.findByTestId$('invokeArgumentValue');
  },
});

const Payment = (wrapped: WebdriverIO.Element) => ({
  get root() {
    return wrapped;
  },
});

export const InvokeScriptTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@scriptInvocation']");
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
    try {
      return await this.root
        .findAllByTestId$('invokeArgument')
        .map(it => Argument(it));
    } catch (e) {
      return [];
    }
  },

  async getPayments() {
    try {
      return await this.root
        .findAllByTestId$('invokeScriptPaymentItem')
        .map(it => Payment(it));
    } catch (e) {
      return [];
    }
  },
};
