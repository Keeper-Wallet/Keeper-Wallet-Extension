export const ImportUsingSeedScreen = {
  get root() {
    return browser.$("[class*='content@importSeed']");
  },

  get seedInput() {
    return this.root.$("[class*='input@Input']")
  },

  get importAccountButton() {
    return this.root.findByText$("Import Account");
  },

  get switchAccountButton() {
    return this.root.findByText$("Switch account");
  },

  get errorMessage() {
    return this.root.findByTestId$("validationError");
  },

  get addressField() {
    return this.root.findByTestId$("address");
  }
}