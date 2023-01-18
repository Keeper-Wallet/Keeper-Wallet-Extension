export const UpdateAssetInfoTransactionScreen = {
  get root() {
    return $("[class*='transaction@']");
  },

  get assetId() {
    return this.root.findByTestId$('updateAssetInfoAssetId');
  },

  get assetName() {
    return this.root.findByTestId$('updateAssetInfoAssetName');
  },

  get assetDescription() {
    return this.root.findByTestId$('updateAssetInfoAssetDescription');
  },

  get fee() {
    return this.root.findByTestId$('updateAssetInfoFee');
  },
};
