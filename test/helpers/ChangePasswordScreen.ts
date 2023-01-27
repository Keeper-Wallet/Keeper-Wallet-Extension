export const ChangePasswordScreen = {
  get root() {
    return $("[class*='newPassword@changePassword']");
  },

  get oldPasswordInput() {
    return this.root.$('#old');
  },

  get oldPasswordError() {
    return this.root.findByTestId$('oldError');
  },

  get newPasswordInput() {
    return this.root.$('#first');
  },

  get newPasswordError() {
    return this.root.findByTestId$('firstError');
  },

  get passwordConfirmationInput() {
    return this.root.$('#second');
  },

  get passwordConfirmationError() {
    return this.root.findByTestId$('secondError');
  },

  get saveButton() {
    return this.root.findByText$('Save');
  },

  get notification() {
    return $('.modal.notification');
  },
};
