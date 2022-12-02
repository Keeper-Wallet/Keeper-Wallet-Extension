export const NewWalletScreen = {
  get root() {
    return browser.$("[class*='content@newwallet']");
  },

  get continueButton() {
    return this.root.findByText$("Continue");
  },

  get accountAddressField() {
    return this.root.$("[class*='greyLine@newwallet']");
  },

  get avatars() {
    return this.root.$$("[class*='avatar@avatar']");
  }
};