export const AccountInfoScreen = {
  get root() {
    return browser.$("[class*='content@accountInfo']");
  },

  get deleteAccountButton() {
    return this.root.findByText$('Delete account');
  },

  get address() {
    return this.root.$("#accountInfoAddress [class*='copyTextOverflow@copy']");
  },

  get publicKey() {
    return this.root.$(
      "#accountInfoPublicKey [class*='copyTextOverflow@copy']"
    );
  },

  get privateKey() {
    return this.root.$(
      "#accountInfoPublicKey [class*='copyTextOverflow@copy']"
    );
  },

  get backupPhrase() {
    return this.root.$(
      "#accountInfoBackupPhrase [class*='copyTextOverflow@copy']"
    );
  },

  get privateKeyCopyButton() {
    return this.root.$("#accountInfoPrivateKey [class*='lastIcon@copy']");
  },

  get backupPhraseCopyButton() {
    return this.root.$("#accountInfoBackupPhrase [class*='lastIcon@copy']");
  },

  get modalPasswordInput() {
    return browser.$("[class*='modalWrapper@modal'] [class*='password@Input']");
  },

  get modalCancelButton() {
    return browser.$("[class*='modalWrapper@modal'] #passwordCancel");
  },

  get name() {
    return this.root.$("[class*='accountName@accountInfo']");
  },

  get notification() {
    return browser.$('.modal.notification');
  },
};
