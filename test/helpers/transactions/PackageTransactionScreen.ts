const InvokeArgument = (wrapped: WebdriverIO.Element) => ({
  get type() {
    return wrapped.findByTestId$('invokeArgumentType');
  },

  get value() {
    return wrapped.findByTestId$('invokeArgumentValue');
  },
});

const PackageItem = (wrapped: WebdriverIO.Element) => ({
  get type() {
    return wrapped.findByTestId$('issueType');
  },

  get amount() {
    return wrapped.findByTestId$('issueAmount');
  },

  get description() {
    return wrapped.findByTestId$('issueDescription');
  },

  get decimals() {
    return wrapped.findByTestId$('issueDecimals');
  },

  get reissuable() {
    return wrapped.findByTestId$('issueReissuable');
  },

  get contentScript() {
    return wrapped.findByTestId$('contentScript');
  },

  get fee() {
    return wrapped.findByTestId$('txFee');
  },

  get transferAmount() {
    return wrapped.findByTestId$('transferAmount');
  },

  get recipient() {
    return wrapped.findByTestId$('recipient');
  },

  get attachmentContent() {
    return wrapped.findByTestId$('attachmentContent');
  },

  get reissueAmount() {
    return wrapped.findByTestId$('reissueAmount');
  },

  get burnAmount() {
    return wrapped.findByTestId$('burnAmount');
  },

  get leaseAmount() {
    return wrapped.findByTestId$('leaseAmount');
  },

  get leaseRecipient() {
    return wrapped.findByTestId$('leaseRecipient');
  },

  get cancelLeaseAmount() {
    return wrapped.findByTestId$('cancelLeaseAmount');
  },

  get cancelLeaseRecipient() {
    return wrapped.findByTestId$('cancelLeaseRecipient');
  },

  get invokeScriptPaymentsTitle() {
    return wrapped.findByTestId$('invokeScriptPaymentsTitle');
  },

  get invokeScriptDApp() {
    return wrapped.findByTestId$('invokeScriptDApp');
  },

  get invokeScriptFunction() {
    return wrapped.findByTestId$('invokeScriptFunction');
  },

  async getInvokeArguments() {
    return await wrapped
      .findAllByTestId$('invokeArgument')
      .map(it => InvokeArgument(it));
  },

  get invokeScriptPaymentItems() {
    return wrapped.findAllByTestId$('invokeScriptPaymentItem');
  },
});

export const PackageTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@package']");
  },

  get packageCountTitle() {
    return this.root.findByTestId$('packageCountTitle');
  },

  get packageAmounts() {
    return this.root.findAllByTestId$('packageAmountItem');
  },

  get packageFees() {
    return this.root.findAllByTestId$('packageFeeItem');
  },

  get showTransactionsButton() {
    return this.root.findByTestId$('packageDetailsToggle');
  },

  async getPackageItems() {
    return await this.root
      .findAllByTestId$('packageItem')
      .map(it => PackageItem(it));
  },
};
