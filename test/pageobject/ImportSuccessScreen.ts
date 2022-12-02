export const ImportSuccessScreen = {
  get root() {
    return browser.findByTestId$("importSuccessForm");
  },

  get addAnotherAccountButton() {
    return this.root.findByText$("Add another account");
  }
};