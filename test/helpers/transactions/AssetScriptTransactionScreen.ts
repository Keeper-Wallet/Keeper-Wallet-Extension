export const AssetScriptTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get asset() {
    return this.root.findByTestId$('setAssetScriptAsset');
  },

  get script() {
    return this.root.findByTestId$('contentScript');
  },
};
