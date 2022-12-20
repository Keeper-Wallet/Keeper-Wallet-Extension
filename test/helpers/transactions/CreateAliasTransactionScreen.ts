export const CreateAliasTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@alias]");
  },

  get aliasValue() {
    return this.root.findByTestId$('aliasValue');
  },
};
