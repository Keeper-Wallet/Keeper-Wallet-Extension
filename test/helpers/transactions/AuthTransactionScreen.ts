export const AuthTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
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

  async setResolutionTime(time: string) {
    await this.root.$("[class*='trigger@Select']").click();
    await this.root
      .findByText$(time, { selector: "[class*='item@Select']" })
      .click();
  },

  get spendingLimitInput() {
    return this.root.$("[class*='amountInput@']");
  },

  get rejectArrowButton() {
    return this.root.$("[class*='arrowButton@dropdownButton']");
  },

  get addToBlacklistButton() {
    return this.root.$('#rejectForever');
  },
};
