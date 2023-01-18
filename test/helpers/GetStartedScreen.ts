export const GetStartedScreen = {
  get root() {
    return $("[class*='content@Welcome-module']");
  },

  get getStartedButton() {
    return this.root.findByText$('Get Started');
  },
};
