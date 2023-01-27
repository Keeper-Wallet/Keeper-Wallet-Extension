export const EmptyHomeScreen = {
  isDisplayed: async () => {
    try {
      return await browser
        .findByTestId$('importForm', {}, { timeout: 5000 })
        .isDisplayed();
    } catch (e) {
      return false;
    }
  },

  get root() {
    return browser.findByTestId$('importForm');
  },

  get addButton() {
    return this.root.findByText$('Add account');
  },
};
