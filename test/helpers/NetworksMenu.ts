export const NetworksMenu = {
  get root() {
    return $("[class*='network@bottomPanel']");
  },

  networkByName(network: string) {
    return this.root.findByText$(network, {
      selector: "[class*='dropdownItem@bottomPanel']",
    });
  },

  get editButton() {
    return this.root.$("[class*='editButton@bottomPanel']");
  },

  get networkMenuButton() {
    return this.root.$("[class*='dropdownButton@bottomPanel']");
  },
};
