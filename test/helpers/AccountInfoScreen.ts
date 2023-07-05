import { type ChainablePromiseElement } from 'webdriverio';

const PasswordModal = (
  wrapped: ChainablePromiseElement<WebdriverIO.Element>,
) => ({
  get passwordInput() {
    return wrapped.$("[class*='password@Input']");
  },

  get cancelButton() {
    return wrapped.$('#passwordCancel');
  },
});

export const AccountInfoScreen = {
  get root() {
    return $("[class*='content@accountInfo']");
  },

  get deleteAccountButton() {
    return this.root.findByText$('Delete account');
  },

  get address() {
    return this.root.$("#accountInfoAddress [class*='copyTextOverflow@copy']");
  },

  get publicKey() {
    return this.root.$(
      "#accountInfoPublicKey [class*='copyTextOverflow@copy']",
    );
  },

  get privateKey() {
    return this.root.$(
      "#accountInfoPublicKey [class*='copyTextOverflow@copy']",
    );
  },

  get backupPhrase() {
    return this.root.$(
      "#accountInfoBackupPhrase [class*='copyTextOverflow@copy']",
    );
  },

  get privateKeyCopyButton() {
    return this.root.$("#accountInfoPrivateKey [class*='lastIcon@copy']");
  },

  get backupPhraseCopyButton() {
    return this.root.$("#accountInfoBackupPhrase [class*='lastIcon@copy']");
  },

  get passwordModal() {
    return PasswordModal($("[class*='modalWrapper@modal']"));
  },

  get name() {
    return this.root.$("[class*='accountName@accountInfo']");
  },

  get notification() {
    return $('.modal.notification');
  },
};
