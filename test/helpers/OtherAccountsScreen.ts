const Account = (wrapped: WebdriverIO.Element) => ({
  get root() {
    return wrapped;
  },

  get name() {
    return wrapped.findByTestId$('accountName');
  },

  get accountInfoButton() {
    return wrapped.findByTestId$('accountInfoButton');
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

  async getAccountByName(accountName: string) {
    return Account(
      await this.root.$(
        `.//*[@data-testid='accountCard' and contains(., '${accountName}')]`,
      ),
    );
  },

  get searchInput() {
    return this.root.findByTestId$('accountsSearchInput');
  },

  get accountsNote() {
    return this.root.findByTestId$('accountsNote');
  },

  get searchClearButton() {
    return this.root.findByTestId$('searchClear');
  },
};
