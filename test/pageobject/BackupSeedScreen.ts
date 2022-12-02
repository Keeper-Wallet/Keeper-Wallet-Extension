export const BackupSeedScreen = {
  get root() {
    return browser.$("[class*='content@backupSeed']");
  },

  get seedField() {
    return this.root.$("[class*='plateMargin@backupSeed']");
  },

  get continueButton() {
    return this.root.findByText$("Continue");
  }
};