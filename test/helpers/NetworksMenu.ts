export const NetworksMenu = {
  get root() {
    return $("[class*='network@network']");
  },

  networkByName(network: string) {
    return this.root.findByText$(network, {
      selector: "[class*='chooseNetwork@network']",
    });
  },

  get editButton() {
    return this.root.$("[class*='editBtn@network']");
  },

  get networkMenuButton() {
    return this.root.$("[class*='networkBottom@network']");
  },
};
