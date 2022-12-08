export const GeneralSettingsScreen = {
  setSessionTimeoutByIndex: async (index: number) => {
    await browser.$("[class*='trigger@Select-module']").click();
    const items = await browser.$$("[class*='item@Select-module']");
    await items.at(index)?.click();
  }
};

const Permission = (wrapped: WebdriverIO.Element) => ({
  get detailsIcon() {
    return wrapped.$("[class*='settings@list']");
  }
});

export const PermissionControlSettingsScreen = {
  get root() {
    return browser.$("[class*='content@permissionsSettings']");
  },

  get permissionItems() {
    return this.root.$$("[class*='permissionItem@list']").map(it => Permission(it));
  },

  get modalDeleteButton() {
    return browser.$("[class*='modalWrapper@modal'] #delete");
  }
};

export const SettingsScreen = {
  get root() {
    return browser.$("[class*='content@settings']");
  },

  get generalSectionLink() {
    return this.root.findByText$("General");
  },

  get permissionsSectionLink() {
    return this.root.findByText$("Permissions control");
  }
};