export const ImportViaSeedScreen = {
  get root() {
    return $("[data-testid='seedInput']")
      .parentElement()
      .parentElement()
      .parentElement()
      .parentElement();
  },

  get seedInput() {
    return $("[data-testid='seedInput']");
  },

  get importAccountButton() {
    return $('[data-testid="continueBtn"]');
  },

  get switchAccountButton() {
    return this.root.findByText$('Switch account');
  },

  get errorMessage() {
    return $("[data-testid='validationError']");
  },

  get address() {
    return this.root.findByTestId$('address');
  },
};
