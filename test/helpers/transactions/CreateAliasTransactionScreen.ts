export const CreateAliasTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@']");
  },

  get aliasValue() {
    return this.root.findByTestId$('aliasValue');
  },
};
