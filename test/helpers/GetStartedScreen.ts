export const GetStartedScreen = {
  get root() {
    return browser.$("[class*='content@Welcome-module']");
  },

  get getStartedButton() {
    return this.root.findByText$('Get Started');
  },
};
