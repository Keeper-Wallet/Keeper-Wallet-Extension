export const NewAccountScreen = {
  get root() {
    return browser.findByTestId$('newAccountForm');
  },

  get passwordInput() {
    return this.root.$('#first');
  },

  get passwordConfirmationInput() {
    return this.root.$('#second');
  },

  get termsAndConditionsCheckbox() {
    return this.root.findByLabelText$(
      'I have read and agree with the Terms and Conditions',
    );
  },

  get privacyPolicyCheckbox() {
    return this.root.findByLabelText$(
      'I have read and agree with the Privacy Policy',
    );
  },

  get continueButton() {
    return this.root.findByText$('Continue');
  },

  get passwordError() {
    return this.root.findByTestId$('firstError');
  },

  get passwordConfirmationError() {
    return this.root.findByTestId$('secondError');
  },
};
