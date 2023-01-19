export const ExportAndImportSettingsScreen = {
  get root() {
    return $("[class*='content@ExportAndImport']");
  },

  get exportAccountsLink() {
    return this.root.findByText$('Export accounts');
  },
};
