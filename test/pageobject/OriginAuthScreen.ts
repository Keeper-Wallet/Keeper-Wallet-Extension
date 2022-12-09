export const OriginAuthScreen = {
  get root() {
    return browser.$("[class*='transaction@originAuth']");
  },

  get permissionDetailsButton() {
    return this.root.findByText$("Permission details");
  },

  get allowMessagesCheckbox() {
    return this.root.findByText$("Allow sending messages");
  },

  get authButton() {
    return this.root.findByText$("Auth");
  },
};