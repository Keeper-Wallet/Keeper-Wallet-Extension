import { type ChainablePromiseElement } from 'webdriverio';

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

const PermissionDetailsModal = (
  wrapped: ChainablePromiseElement<WebdriverIO.Element>,
) => ({
  get root() {
    return wrapped;
  },

  get deleteButton() {
    return wrapped.$('#delete');
  },

  get saveButton() {
    return wrapped.$('#save');
  },

  async setResolutionTime(time: string) {
    await wrapped.$("[class*='trigger@Select']").click();
    await browser
      .findByText$(time, { selector: "[class*='item@Select']" })
      .click();
  },

  get spendingLimitInput() {
    return wrapped.$("[class*='amountInput@settings']");
  },

  get allowMessagesCheckbox() {
    return browser
      .$("[class*='modalWrapper@modal']")
      .findByText$('Allow sending messages');
  },
});

export const PermissionControlSettingsScreen = {
  get root() {
    return $("[class*='content@permissionsSettings']");
  },

  get permissionDetailsModal() {
    return PermissionDetailsModal($("[class*='modalWrapper@modal']"));
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
};
