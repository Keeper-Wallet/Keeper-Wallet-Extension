import * as ObservableStore from 'obs-store';
import { WalletController } from './WalletController';
import { IdentityController } from './IdentityController';
import LocalStore from '../lib/localStore';

type VaultState = { locked: boolean; initialized: boolean };

type Options = {
  localStore: LocalStore;
  wallet: WalletController;
  identity: IdentityController;
};

export class VaultController {
  store: ObservableStore<VaultState>;
  private wallet: WalletController;
  private identity: IdentityController;

  constructor({ localStore, wallet, identity }: Options) {
    this.store = new ObservableStore(
      localStore.getInitState(
        { locked: null, initialized: null },
        { locked: !localStore.getInitSession().password }
      )
    );
    localStore.subscribe(this.store);

    this.wallet = wallet;
    this.identity = identity;
  }

  private get locked(): boolean {
    return this.store.getState().locked;
  }

  private set locked(value) {
    if (this.locked !== value) {
      this.store.updateState({ locked: value });
    }
  }

  private get initialized(): boolean {
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

    if (state.initialized != null) {
      this.store.updateState({
        initialized: state.initialized,
      });

      delete state.locked;
      delete state.initialized;
      this.wallet.store.putState(state);
    }

    if (state.vault) {
      this.store.updateState({ initialized: true });
    }
  }
}
