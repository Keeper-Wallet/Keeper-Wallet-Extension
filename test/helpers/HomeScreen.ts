const AssetCard = (wrapped: WebdriverIO.Element) => ({
  get moreButton() {
    return wrapped.findByTestId$('moreBtn');
  },

  get clickButton() {
    return wrapped;
  },
});

export const HomeScreen = {
  isDisplayed: async () => {
    try {
      return await browser
        .findByTestId$('assetsForm', {}, { timeout: 5000 })
        .isDisplayed();
    } catch (e) {
      return false;
    }
  },

  get root() {
    return browser.findByTestId$('assetsForm');
  },

  get activeAccountCard() {
    return this.root.findByTestId$('activeAccountCard');
  },

  get activeAccountName() {
    return this.activeAccountCard.findByTestId$('accountName');
  },

  get otherAccountsButton() {
    return this.root.findByTestId$('otherAccountsButton');
  },

  get showQRButton() {
    return this.root.$('.showQrIcon');
  },

  get assets() {
    return this.root
      .$$("[class*='assetCard@assetItem']")
      .map(it => AssetCard(it));
  },

  async getAssetByName(name: string) {
    return AssetCard(
      await this.root
        .findByText$(name, { selector: "[class*='assetTitle@assetItem']" })
        .$(".//ancestor::*[contains(@class, 'assetCard@assetItem')]")
    );
  },
};
