export const SettingsMenuScreen = {
  get root() {
    return $("[class*='content@settings']");
  },

  get generalSectionLink() {
    return this.root.findByText$('General');
  },

  get permissionsSectionLink() {
    return this.root.findByText$('Permissions control');
  },

  get exportAndImportSectionLink() {
    return this.root.findByText$('Export and import');
  },

  get deleteAccountsButton() {
    return this.root.findByText$('Delete accounts');
  },

  get logoutButton() {
    return this.root.findByText$('Log out');
  },

  get networkSectionLink() {
    return this.root.findByText$('Network');
  },

  get clickProtectionButton() {
    return this.root.findByTestId$('clickProtectionBtn');
  },

  get clickProtectionIcon() {
    return this.root.findByTestId$('clickProtectionIcon');
  },

  get clickProtectionStatus() {
    return this.root.findByTestId$('clickProtectionStatus');
  },

  get suspiciousAssetsProtectionButton() {
    return this.root.findByTestId$('showSuspiciousAssetsBtn');
  },

  get suspiciousAssetsProtectionIcon() {
    return this.root.findByTestId$('showSuspiciousAssetsIcon');
  },

  get suspiciousAssetsProtectionStatus() {
    return this.root.findByTestId$('showSuspiciousAssetsStatus');
  },

  get helpTooltip() {
    return $("[class*='helpTooltip@settings']");
  },
};
