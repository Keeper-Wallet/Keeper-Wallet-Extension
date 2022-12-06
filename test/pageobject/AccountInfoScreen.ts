export const AccountInfoScreen = {
  get root() {
    return browser.$("[class*='content@accountInfo']");
  },

  get deleteAccountButton() {
    return this.root.findByText$("Delete account");
  },

  get addressField() {
    return this.root.$("#accountInfoAddress [class*='copyTextOverflow@copy']");
  },

  get publicKeyField() {
    return this.root.$("#accountInfoPublicKey [class*='copyTextOverflow@copy']");
  },

  get privateKeyField() {
    return this.root.$("#accountInfoPublicKey [class*='copyTextOverflow@copy']");
  },

  get backupPhraseField() {
    return this.root.$("#accountInfoBackupPhrase [class*='copyTextOverflow@copy']");
  },

  get privateKeyCopyButton() {
    return this.root.$("#accountInfoPublicKey [class*='lastIcon@copy']");
  },

  get backupPhraseCopyButton() {
    return this.root.$("#accountInfoBackupPhrase [class*='lastIcon@copy']");
  },

  get modalPasswordInput() {
    return browser.$("[class*='modalWrapper@modal'] [class*='password@Input']");
  },

  get modalCancelButton() {
    return browser.$("[class*='modalWrapped@modal'] #passwordCancel");
  },

  get nameField() {
    return this.root.$("[class*='accountName@accountInfo']")
  }
};