const Account = (wrapped: WebdriverIO.Element) => ({
  get nameField() {
    return wrapped.findByTestId$("accountName");
  }
});


export const OtherAccountsScreen = {
  get root() {
    return browser.findByTestId$("otherAccountsPage");
  },

  get addAccountButton() {
    return this.root.findByText$("Add account");
  },

  get accounts() {
    return this.root.queryAllByTestId$("accountCard").map(it => Account(it));
  }
};