import ObservableStore from 'obs-store';

import { type ExtensionStorage } from '../storage/storage';
import { type IdentityController } from './IdentityController';
import { type WalletController } from './wallet';

export class VaultController {
  #identity;
  #wallet;

  store;

  constructor({
    extensionStorage,
    wallet,
    identity,
  }: {
    extensionStorage: ExtensionStorage;
    wallet: WalletController;
    identity: IdentityController;
  }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({ locked: false, initialized: false }),
    );

    extensionStorage.subscribe(this.store);

    this.#identity = identity;
    this.#wallet = wallet;

    this.store.updateState({
      initialized: Boolean(wallet.store.getState().WalletController.vault),
      locked: !extensionStorage.getInitSession().password,
    });
  }

  async init(password: string) {
    await this.#wallet.initVault(password);
    this.#identity.initVault(password);
    this.store.updateState({ initialized: true, locked: false });
  }

  lock() {
    this.#wallet.lock();
    this.#identity.lock();
    this.store.updateState({ locked: true });
  }

  async unlock(password: string) {
    await this.#wallet.unlock(password);
    this.#identity.unlock(password);
    this.store.updateState({ locked: false });
  }

  async update(oldPassword: string, newPassword: string) {
    await Promise.all([
      this.#wallet.newPassword(oldPassword, newPassword),
      this.#identity.updateVault(oldPassword, newPassword),
    ]);
  }

  async clear() {
    await this.#wallet.deleteVault();
    this.#identity.deleteVault();
    this.store.updateState({ initialized: false, locked: true });
  }

  isLocked() {
    return this.store.getState().locked;
  }

  migrate() {
    const state = this.#wallet.store.getState().WalletController;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((state as any).initialized != null) {
      this.store.updateState({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialized: (state as any).initialized,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (state as any).locked;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (state as any).initialized;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.#wallet.store.putState(state as any);
    }
  }
}
