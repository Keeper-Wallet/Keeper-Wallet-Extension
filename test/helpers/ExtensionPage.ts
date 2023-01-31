export const ExtensionPage = {
  get root() {
    return browser.$('extensions-manager');
  },

  get toolbar() {
    return this.root.shadow$('extensions-toolbar');
  },

  get devModeToggle() {
    return this.toolbar.shadow$('#devMode');
  },

  get updateButton() {
    return this.toolbar.shadow$('#updateNow');
  },
};
