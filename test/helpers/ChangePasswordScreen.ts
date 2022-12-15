export const ChangePasswordScreen = {
  get root() {
    return browser.$("[class*='newPassword@changePassword']");
  },

  get oldPasswordInput() {
    return this.root.$('#old');
  },

  get oldPasswordError() {
    return this.root.$('#oldError');
  },

  get newPasswordInput() {
    return this.root.$('#first');
  },

  get newPasswordError() {
    return this.root.$('#firstError');
  },

  get passwordConfirmationInput() {
    return this.root.$('#second');
  },

  get passwordConfirmationError() {
    return this.root.$('#secondError');
  },

  get saveButton() {
    return this.root.findByText$('Save');
  },

  get notification() {
    return browser.$('.modal.notification');
  },
};
