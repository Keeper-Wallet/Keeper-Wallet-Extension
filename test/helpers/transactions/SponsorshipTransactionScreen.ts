export const SponsorshipTransactionScreen = {
  get root() {
    return browser.$("[class*='transaction@sponsorship']");
  },

  get title() {
    return this.root.findByTestId$('sponsorshipTitle');
  },

  get amount() {
    return this.root.findByTestId$('sponsorshipAmount');
  },

  get asset() {
    return this.root.findByTestId$('sponsorshipAsset');
  },
};
