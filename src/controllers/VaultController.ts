import ObservableStore from 'obs-store';
import { WalletController } from './wallet';
import { IdentityController } from './IdentityController';
import { ExtensionStore as LocalStore } from '../storage/storage';

export class VaultController {
  store;
  private wallet;
  private identity;

  constructor({
    localStore,
    wallet,
    identity,
  }: {
    localStore: LocalStore;
    wallet: WalletController;
    identity: IdentityController;
  }) {
    this.store = new ObservableStore(
      localStore.getInitState(
        { locked: null, initialized: null },
        { locked: !localStore.getInitSession().password }
      )
    );
    localStore.subscribe(this.store);

    this.wallet = wallet;
    this.identity = identity;

    const { vault } = wallet.store.getState().WalletController;
    if (vault) {
      this.store.updateState({ initialized: true });
    }
  }

  private get locked() {
    return this.store.getState().locked;
  }

  private set locked(value) {
    if (this.locked !== value) {
      this.store.updateState({ locked: value });
    }
  }

  private get initialized() {
    return this.store.getState().initialized;
  }

  private set initialized(value) {
    if (this.initialized !== value) {
      this.store.updateState({ initialized: value });
    }
  }

  init(password: string) {
    this.wallet.initVault(password);
    this.identity.initVault(password);

    this.locked = false;
    this.initialized = true;
  }

  lock() {
    this.wallet.lock();
    this.identity.lock();

    this.locked = true;
  }

  unlock(password: string) {
    this.wallet.unlock(password);
    this.identity.unlock(password);

    this.locked = false;
  }

  update(oldPassword: string, newPassword: string) {
    this.wallet.newPassword(oldPassword, newPassword);
    this.identity.updateVault(oldPassword, newPassword);
  }

  clear() {
    this.wallet.deleteVault();
    this.identity.deleteVault();

    this.locked = true;
    this.initialized = false;
  }

  isLocked() {
    return this.locked;
  }

  migrate() {
    const state = this.wallet.store.getState().WalletController;

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
      this.wallet.store.putState(state as any);
    }
  }
}
