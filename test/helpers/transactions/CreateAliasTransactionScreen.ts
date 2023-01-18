export const CreateAliasTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get aliasValue() {
    return this.root.findByTestId$('aliasValue');
  },
};
