import { ChainablePromiseElement } from "webdriverio";

const PillsContainer = (wrapped: ChainablePromiseElement<WebdriverIO.Element>) => ({
  getPillByText: async (text: string) => {
    const pills = await wrapped.findAllByText$(text, {selector: "[class*='text@pills']:not([class*='hiddenPill@pills'])"})
    if (pills.length > 0) {
      ``
      return pills[0];
    } else {
      throw Error(`No pills with text '${text}' found.`);
    }
  },

  getAllPills: async () => {
    return wrapped.$$("[class*='pill@pills']:not([class*='hiddenPill@pills'])");
  }
});

export const ConfirmBackupScreen = {
  get root() {
    return browser.$("[class*='content@confirmBackup']");
  },

  get suggestedPillsContainer() {
    return PillsContainer(this.root.$("[class*='writeSeed@confirmBackup']"));
  },

  get selectedPillsContainer() {
    return PillsContainer(this.root.$("[class*='readSeed@confirmBackup']"));
  },

  get confirmButton() {
    return this.root.findByText$("Confirm");
  },

  get clearLink() {
    return this.root.findByText$("Clear");
  },

  get errorMessage() {
    return this.root.$("[class*='error@error']");
  }
};