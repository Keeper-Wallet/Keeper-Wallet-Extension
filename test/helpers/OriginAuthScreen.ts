export const OriginAuthScreen = {
  get root() {
    return browser.$("[class*='transaction@originAuth']");
  },

  get permissionDetailsButton() {
    return this.root.findByText$('Permission details');
  },

  get allowMessagesCheckbox() {
    return this.root.findByText$('Allow sending messages');
  },

  get authButton() {
    return this.root.findByText$('Auth');
  },

  get originAddress() {
    return this.root.$("[class*='originAddress@transactions']");
  },

  get originNetwork() {
    return this.root.$("[class*='originNetwork@transactions']");
  },

  get accountName() {
    return this.root.$("[class*='accountName@wallet']");
  },

  get rejectButton() {
    return this.root.$('#reject');
  },

  async setResolutionTime(time: string) {
    await this.root.$("[class*='trigger@Select']").click();
    await this.root
      .findByText$(time, { selector: "[class*='item@Select']" })
      .click();
  },

  get spendingLimitInput() {
    return this.root.$("[class*='amountInput@settings']");
  },
};
