export const GeneralSettingsScreen = {
  setSessionTimeoutByName: async (name: string) => {
    await browser.$("[class*='trigger@Select-module']").click();
    await browser
      .findByText$(name, { selector: "[class*='item@Select-module']" })
      .click();
  },
};

const Permission = (wrapped: WebdriverIO.Element) => ({
  get detailsIcon() {
    return wrapped.$("[class*='settings@list']");
  },
});

export const PermissionControlSettingsScreen = {
  get root() {
    return browser.$("[class*='content@permissionsSettings']");
  },

  get permissionItems() {
    return this.root
      .$$("[class*='permissionItem@list']")
      .map(it => Permission(it));
  },

  async getPermissionByOrigin(origin: string) {
    return Permission(await this.root.findByText$(origin).parentElement());
  },

  get modalDeleteButton() {
    return browser.$("[class*='modalWrapper@modal'] #delete");
  },

  get modalSaveButton() {
    return browser.$("[class*='modalWrapper@modal'] #save");
  },

  get modalAllowMessagesCheckbox() {
    return browser
      .$("[class*='modalWrapper@modal']")
      .findByText$('Allow sending messages');
  },
};

export const SettingsScreen = {
  get root() {
    return browser.$("[class*='content@settings']");
  },

  get generalSectionLink() {
    return this.root.findByText$('General');
  },

  get permissionsSectionLink() {
    return this.root.findByText$('Permissions control');
  },

  get deleteAccountsButton() {
    return this.root.findByText$('Delete accounts');
  },
};
