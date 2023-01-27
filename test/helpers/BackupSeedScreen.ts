export const BackupSeedScreen = {
  get root() {
    return $("[class*='content@backupSeed']");
  },

  get seed() {
    return this.root.$("[class*='plateMargin@backupSeed']");
  },

  get continueButton() {
    return this.root.findByText$('Continue');
  },
};
