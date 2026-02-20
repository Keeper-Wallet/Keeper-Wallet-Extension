export const AccountOnboardingScreen = {
  get root() {
    return $('[data-testid="accountOnboarding"]');
  },

  get createMultichainAccountButton() {
    return $('[data-testid="createMultichainAccountBtn"]');
  },

  get createWavesAccountButton() {
    // The second button in the onboarding screen
    return this.root.$$('button')[1];
  },
};
