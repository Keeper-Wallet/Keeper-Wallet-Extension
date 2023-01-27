export const IssueTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get issueAmount() {
    return this.root.findByTestId$('issueAmount');
  },

  get issueType() {
    return this.root.findByTestId$('issueType');
  },

  get issueDescription() {
    return this.root.findByTestId$('issueDescription');
  },

  get issueDecimals() {
    return this.root.findByTestId$('issueDecimals');
  },

  get issueReissuable() {
    return this.root.findByTestId$('issueReissuable');
  },

  get contentScript() {
    return this.root.findByTestId$('contentScript');
  },
};
