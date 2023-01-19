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
