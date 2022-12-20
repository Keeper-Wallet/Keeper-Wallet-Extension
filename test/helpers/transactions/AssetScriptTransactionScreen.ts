export const AssetScriptTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@assetScript']");
  },

  get asset() {
    return this.root.findByTestId$('setAssetScriptAsset');
  },

  get script() {
    return this.root.findByTestId$('contentScript');
  },
};
