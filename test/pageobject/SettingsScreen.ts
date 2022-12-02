export const GeneralSettingsScreen = {
  setSessionTimeoutByIndex: async (index: number) => {
    await browser.$("[class*='trigger@Select-module']").click();
    const items = await browser.$$("[class*='item@Select-module']");
    await items.at(index)?.click();
  }
};

export const SettingsScreen = {
  get root() {
    return browser.$("[class*='content@settings']");
  },

  get generalSectionLink() {
    return this.root.findByText$("General");
  }
};