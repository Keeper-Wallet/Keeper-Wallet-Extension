export const ImportKeystoreFileScreen = {
  get root() {
    return browser.$("[class*='root@chooseFile']");
  },

  get fileInput() {
    return this.root.findByTestId$("fileInput");
  },

  get passwordInput() {
    return this.root.findByTestId$("passwordInput");
  },

  get continueButton() {
    return this.root.findByTestId$("submitButton");
  },
};