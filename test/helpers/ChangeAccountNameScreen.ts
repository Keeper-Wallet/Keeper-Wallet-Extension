export const ChangeAccountNameScreen = {
  get root() {
    return browser.$("[class*='content@changeName']");
  },

  get currentName() {
    return this.root.$('#currentAccountName');
  },

  get newNameInput() {
    return this.root.$('#newAccountName');
  },

  get error() {
    return this.root.findByTestId$('newAccountNameError');
  },

  get saveButton() {
    return this.root.$('#save');
  },
};
