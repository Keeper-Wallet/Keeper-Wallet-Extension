const Account = (wrapped: WebdriverIO.Element) => ({
  get nameField() {
    return wrapped.findByTestId$('accountName');
  },

  get checkbox() {
    return wrapped.$("[name='selected']");
  },

  async isSelected() {
    const checkbox = await this.checkbox;
    if (!(await checkbox.isExisting())) return null;
    return await checkbox.isSelected();
  },

  async getAddress() {
    return await wrapped.getAttribute('title');
  },
});

const AccountsGroup = (wrapped: WebdriverIO.Element) => ({
  get label() {
    return wrapped.findByTestId$('accountsGroupLabel');
  },

  get accounts() {
    return wrapped.findAllByTestId$('accountCard').map(it => Account(it));
  },
});

export const ChooseAccountsForm = {
  get root() {
    return browser.findByTestId$('chooseAccountsForm');
  },

  get importButton() {
    return this.root.findByTestId$('submitButton');
  },

  get accountsGroups() {
    return this.root
      .findAllByTestId$('accountsGroup')
      .map(it => AccountsGroup(it));
  },

  get accounts() {
    return this.root.findAllByTestId$('accountCard').map(it => Account(it));
  },

  get skipButton() {
    return this.root.findByText$('Skip');
  },

  async getAccountByAddress(address: string) {
    return Account(
      await this.root.$(`[data-testid='accountCard'][title='${address}']`)
    );
  },
};
