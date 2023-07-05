import { type ChainablePromiseElement } from 'webdriverio';

const PillsContainer = (
  wrapped: ChainablePromiseElement<WebdriverIO.Element>,
) => ({
  getPillByText: async (text: string) => {
    return wrapped.$(
      `.//*[contains(@class, 'pill@pills') and not(contains(@class, 'hiddenPill@pills')) and contains(., '${text}')]`,
    );
  },

  getAllPills: async () => {
    return wrapped.$$("[class*='pill@pills']:not([class*='hiddenPill@pills'])");
  },
});

export const ConfirmBackupScreen = {
  get root() {
    return $("[class*='content@confirmBackup']");
  },

  get suggestedPillsContainer() {
    return PillsContainer(this.root.$("[class*='writeSeed@confirmBackup']"));
  },

  get selectedPillsContainer() {
    return PillsContainer(this.root.$("[class*='readSeed@confirmBackup']"));
  },

  get confirmButton() {
    return this.root.findByText$('Confirm');
  },

  get clearLink() {
    return this.root.findByText$('Clear');
  },

  get errorMessage() {
    return this.root.$("[class*='error@error']");
  },
};
