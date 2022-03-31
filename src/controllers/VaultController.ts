import * as ObservableStore from 'obs-store';
import { WalletController } from './WalletController';
import { IdentityController } from './IdentityController';

type VaultState = { locked: boolean; initialized: boolean };

type Options = {
  initState: VaultState;
  wallet: WalletController;
  identity: IdentityController;
};

export class VaultController {
  store: ObservableStore<VaultState>;
  private wallet: WalletController;
  private identity: IdentityController;
  private password: string;

  constructor(opts: Options) {
    this.store = new ObservableStore(
      Object.assign({}, { locked: null, initialized: null }, opts.initState, {
        locked: true,
      })
    );
    this.wallet = opts.wallet;
    this.identity = opts.identity;
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

    this.password = password;
    this.locked = false;
    this.initialized = true;
  }

  lock() {
    this.wallet.lock();
    this.identity.lock();

    this.password = null;
    this.locked = true;
  }

  unlock(password) {
    this.wallet.unlock(password);
    this.identity.unlock(password);

    this.password = password;
    this.locked = false;
  }

  clear() {
    this.wallet.deleteVault();
    this.identity.deleteVault();

    this.password = null;
    this.locked = true;
    this.initialized = false;
  }

  isLocked() {
    return this.locked;
  }

  isReady() {
    return !this.locked && this.initialized;
  }

  migrate() {
    const state = this.wallet.store.getState();
    if (state.initialized != null) {
      this.store.updateState({
        initialized: state.initialized,
      });

      delete state.locked;
      delete state.initialized;
      this.wallet.store.putState(state);
    }
  }
}
