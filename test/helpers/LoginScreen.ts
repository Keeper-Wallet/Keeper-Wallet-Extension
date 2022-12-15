export const LoginScreen = {
  get root() {
    return browser.$("[class*='content@login']");
  },

  get passwordInput() {
    return this.root.$('#loginPassword');
  },

  get passwordError() {
    return this.root.$('#loginPasswordError');
  },

  get enterButton() {
    return this.root.$('#loginEnter');
  },

  get forgotPasswordLink() {
    return this.root.findByText$('I forgot password');
  },
};
