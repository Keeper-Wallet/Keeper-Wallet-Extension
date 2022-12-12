const Account = (wrapped: WebdriverIO.Element) => ({
  get nameField() {
    return wrapped.findByTestId$('accountName');
  },

  get accountInfoButton() {
    return wrapped.findByTestId$('accountInfoButton');
  },

  async select() {
    await wrapped.click();
  },
});

export const OtherAccountsScreen = {
  get root() {
    return browser.findByTestId$('otherAccountsPage');
  },

  get addAccountButton() {
    return this.root.findByText$('Add account');
  },

  get accounts() {
    return this.root.queryAllByTestId$('accountCard').map(it => Account(it));
  },

  get searchInput() {
    return this.root.findByTestId$('accountsSearchInput');
  },

  get accountsNoteField() {
    return this.root.findByTestId$('accountsNote');
  },

  get searchClearButton() {
    return this.root.findByTestId$('searchClear');
  },
};
