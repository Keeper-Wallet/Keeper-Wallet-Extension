export const GeneralSettingsScreen = {
  setSessionTimeoutByName: async (name: string) => {
    const currentValue = await browser
      .$("[class*='trigger@Select-module']")
      .getText();
    if (currentValue === name) return;
    await $("[class*='trigger@Select-module']").click();
    await browser
      .findByText$(name, { selector: "[class*='item@Select-module']" })
      .click();
  },

  get root() {
    return $("[class*='content@settings']");
  },

  get changePasswordLink() {
    return this.root.$('#changePassword');
  },
};

const Permission = (wrapped: WebdriverIO.Element) => ({
  get root() {
    return wrapped;
  },

  get detailsIcon() {
    return wrapped.$("[class*='settings@list']");
  },

  get status() {
    return wrapped.$("[class*='statusColor@list']");
  },

  get origin() {
    return wrapped.$('div');
  },

  get enableCheckbox() {
    return wrapped.$('button');
  },
});

export const PermissionControlSettingsScreen = {
  get root() {
    return $("[class*='content@permissionsSettings']");
  },

  get permissionItems() {
    return this.root
      .$$("[class*='permissionItem@list']")
      .map(it => Permission(it));
  },

  get whiteListLink() {
    return this.root.findByText$('White list');
  },

  async getPermissionByOrigin(origin: string) {
    return Permission(await this.root.findByText$(origin).parentElement());
  },

  get modalDeleteButton() {
    return $("[class*='modalWrapper@modal'] #delete");
  },

  get modalSaveButton() {
    return $("[class*='modalWrapper@modal'] #save");
  },

  async modalSetResolutionTime(time: string) {
    await browser
      .$("[class*='modalWrapper@modal'] [class*='trigger@Select']")
      .click();
    await browser
      .findByText$(time, { selector: "[class*='item@Select']" })
      .click();
  },

  get modalSpendingLimitInput() {
    return $("[class*='amountInput@settings']");
  },

  get modalAllowMessagesCheckbox() {
    return browser
      .$("[class*='modalWrapper@modal']")
      .findByText$('Allow sending messages');
  },
};

export const ExportAndImportSettingsScreen = {
  get root() {
    return $("[class*='content@ExportAndImport']");
  },

  get exportAccountsLink() {
    return this.root.findByText$('Export accounts');
  },
};

export const NetworkSettingsScreen = {
  get root() {
    return $("[class*='networkTab@settings']");
  },

  get nodeAddress() {
    return this.root.$('#node_address');
  },

  get matcherAddress() {
    return this.root.$('#node_address');
  },

  get setDefaultButton() {
    return this.root.$('#setDefault');
  },
};

export const SettingsScreen = {
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
