export const HomeScreen = {
  isDisplayed: async () => {
    try {
      return await browser.findByTestId$("assetsForm", {}, {timeout: 5000}).isDisplayed();
    } catch (e) {
      return false;
    }
  },

  get root() {
    return browser.findByTestId$("assetsForm");
  },

  get activeAccountCard() {
    return this.root.findByTestId$("activeAccountCard");
  },

  get activeAccountNameField() {
    return this.activeAccountCard.findByTestId$("accountName");
  },

  get otherAccountsButton() {
    return this.root.findByTestId$("otherAccountsButton");
  }
};